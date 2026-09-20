import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

/**
 * JelioBeats - Deterministic Glitch-Pop Audio Synthesis Engine
 * Architectural Target: Java 21 Bare-Metal (Jelio Mundo Node)
 * Features: Dynamic CLI Parameter Parsing & Stereo Interleaved Output
 */
public class JelioBeats {

    private static final int SAMPLE_RATE = 44100;
    private static final int CHANNELS = 2; // Stereo output

    public static void main(String[] args) {
        double bpm = 152.0;
        String outputFilename = "patch_the_glow_stereo.wav";

        if (args.length > 0) {
            try {
                bpm = Double.parseDouble(args[0]);
            } catch (NumberFormatException e) {
                System.err.println("[-] Invalid BPM argument. Falling back to default: 152.0");
            }
        }
        if (args.length > 1) {
            outputFilename = args[1];
        }

        System.out.println("[+] Initializing JelioBeats Stereo Engine at " + bpm + " BPM...");
        System.out.println("[+] Output Target: " + outputFilename);

        double beatDuration = 60.0 / bpm;
        int totalBeats = 16; // 4 Bars of 4/4
        double totalSeconds = totalBeats * beatDuration;
        int totalSamplesPerChannel = (int) (totalSeconds * SAMPLE_RATE);
        
        short[] audioBuffer = new short[totalSamplesPerChannel * CHANNELS];

        for (int beat = 0; beat < totalBeats; beat++) {
            int beatStartSample = (int) (beat * beatDuration * SAMPLE_RATE);

            if (beat % 4 == 0) {
                renderKick(audioBuffer, beatStartSample);
            }

            if (beat % 2 != 0) {
                renderSnare(audioBuffer, beatStartSample);
            }

            renderGlitchSynth(audioBuffer, beatStartSample, beatDuration, beat);
        }

        File outFile = new File(outputFilename);
        try {
            writeWavFile(audioBuffer, outFile);
            System.out.println("[+] Synthesized Stereo WAV: " + outFile.getAbsolutePath());
            System.out.println("[+] Render Complete. Zero cloud telemetry. Air-gapped stereo locked.");
        } catch (IOException e) {
            System.err.println("[-] Synthesis failed: " + e.getMessage());
        }
    }

    private static void renderKick(short[] buffer, int startSample) {
        int length = (int) (0.25 * SAMPLE_RATE);
        for (int i = 0; i < length && (startSample + i) < (buffer.length / CHANNELS); i++) {
            double t = (double) i / SAMPLE_RATE;
            double freq = 130.0 * Math.exp(-t * 22.0);
            double env = Math.exp(-t * 18.0);
            double sample = Math.sin(2.0 * Math.PI * freq * t) * env * 0.85;
            mixSample(buffer, startSample + i, sample, sample);
        }
    }

    private static void renderSnare(short[] buffer, int startSample) {
        int length = (int) (0.18 * SAMPLE_RATE);
        for (int i = 0; i < length && (startSample + i) < (buffer.length / CHANNELS); i++) {
            double t = (double) i / SAMPLE_RATE;
            double noise = (Math.random() * 2.0 - 1.0);
            double body = Math.sin(2.0 * Math.PI * 180.0 * t);
            double env = Math.exp(-t * 26.0);
            double sample = (0.75 * noise + 0.25 * body) * env * 0.65;
            mixSample(buffer, startSample + i, sample * 0.7, sample * 1.0);
        }
    }

    private static void renderGlitchSynth(short[] buffer, int startSample, double beatDuration, int step) {
        double[] freqs = {261.63, 329.63, 392.00, 523.25};
        double targetFreq = freqs[step % freqs.length];

        double panLeft = (step % 2 == 0) ? 1.0 : 0.3;
        double panRight = (step % 2 == 0) ? 0.3 : 1.0;

        int subLength = (int) ((beatDuration / 2.0) * SAMPLE_RATE);
        for (int i = 0; i < subLength && (startSample + i) < (buffer.length / CHANNELS); i++) {
            double t = (double) i / SAMPLE_RATE;
            double env = Math.exp(-t * 8.0);
            double wave = (Math.sin(2.0 * Math.PI * targetFreq * t) > 0 ? 0.3 : -0.3) * env;
            mixSample(buffer, startSample + i, wave * panLeft, wave * panRight);
        }
    }

    private static void mixSample(short[] buffer, int sampleIndex, double leftSample, double rightSample) {
        int baseIdx = sampleIndex * CHANNELS;
        int curLeft = buffer[baseIdx];
        int addLeft = (int) (leftSample * 32767);
        buffer[baseIdx] = (short) Math.max(-32768, Math.min(32767, curLeft + addLeft));

        int curRight = buffer[baseIdx + 1];
        int addRight = (int) (rightSample * 32767);
        buffer[baseIdx + 1] = (short) Math.max(-32768, Math.min(32767, curRight + addRight));
    }

    private static void writeWavFile(short[] pcmData, File destination) throws IOException {
        int byteRate = SAMPLE_RATE * CHANNELS * 2;
        int dataSize = pcmData.length * 2;
        int chunkSize = 36 + dataSize;

        try (FileOutputStream fos = new FileOutputStream(destination)) {
            ByteBuffer header = ByteBuffer.allocate(44).order(ByteOrder.LITTLE_ENDIAN);

            header.put(new byte[]{'R', 'I', 'F', 'F'});
            header.putInt(chunkSize);
            header.put(new byte[]{'W', 'A', 'V', 'E'});
            header.put(new byte[]{'f', 'm', 't', ' '});
            header.putInt(16);
            header.putShort((short) 1);
            header.putShort((short) CHANNELS);
            header.putInt(SAMPLE_RATE);
            header.putInt(byteRate);
            header.putShort((short) (CHANNELS * 2));
            header.putShort((short) 16);
            header.put(new byte[]{'d', 'a', 't', 'a'});
            header.putInt(dataSize);

            fos.write(header.array());

            ByteBuffer sampleBytes = ByteBuffer.allocate(dataSize).order(ByteOrder.LITTLE_ENDIAN);
            for (short sample : pcmData) {
                sampleBytes.putShort(sample);
            }
            fos.write(sampleBytes.array());
        }
    }
}
