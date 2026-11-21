import java.net.URI;
import java.net.http.*;
import java.time.Duration;

public class LocalModelBindingTest {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

        String payload = """
            {
              "model": "llama3.2",
              "prompt": "Reply with BINDING_OK only.",
              "stream": false
            }
            """;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("http://127.0.0.1:11434/api/generate"))
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(120))
            .POST(HttpRequest.BodyPublishers.ofString(payload))
            .build();

        HttpResponse<String> response = client.send(
            request,
            HttpResponse.BodyHandlers.ofString()
        );

        System.out.println("HTTP " + response.statusCode());
        System.out.println(response.body());

        if (response.statusCode() != 200 ||
            !response.body().contains("BINDING_OK")) {
            System.exit(1);
        }

        System.out.println("LOCAL_MODEL_BINDING_OK");
    }
}
