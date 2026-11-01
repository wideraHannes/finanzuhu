package de.finanzuhu.web;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiTest {
    @LocalServerPort int port;
    private final HttpClient client = HttpClient.newHttpClient();

    JsonNode get(String path) throws Exception {
        var response = client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).build(), HttpResponse.BodyHandlers.ofString());
        assertThat(response.statusCode()).isEqualTo(200);
        return JsonMapper.builder().build().readTree(response.body());
    }

    @Test void summaryMatchesSharedLedgerForEveryRangeAndDefaults() throws Exception {
        String[][] cases = {{"week", "3045.00", "319.24", "2725.76", "7", "2026-09-19"},
                {"month", "3386.80", "2762.39", "624.41", "31", "2026-08-26"},
                {"3m", "9386.80", "7989.95", "1396.85", "14", "2026-06-26"}};
        for (var values : cases) {
            var result = get("/api/summary?range=" + values[0]);
            assertThat(result.get("balance").decimalValue()).isEqualByComparingTo("7846.85");
            assertThat(result.get("freeToSpend").decimalValue()).isEqualByComparingTo("6446.19");
            assertThat(result.get("asOf").asText()).isEqualTo("2026-09-25");
            assertThat(result.get("range").asText()).isEqualTo(values[0]);
            assertThat(result.get("income").decimalValue()).isEqualByComparingTo(values[1]);
            assertThat(result.get("expenses").decimalValue()).isEqualByComparingTo(values[2]);
            assertThat(result.get("net").decimalValue()).isEqualByComparingTo(values[3]);
            assertThat(result.get("series").size()).isEqualTo(Integer.parseInt(values[4]));
            assertThat(result.get("series").get(0).get("date").asText()).isEqualTo(values[5]);
            assertThat(result.get("series").get(result.get("series").size() - 1).get("balance").decimalValue()).isEqualByComparingTo("7846.85");
        }
        assertThat(get("/api/summary").get("range").asText()).isEqualTo("3m");
        assertThat(get("/api/summary?range=unknown")).isEqualTo(get("/api/summary?range=3m"));
    }

    @Test void filtersCombineAndMetadataSurvivesEmptyResults() throws Exception {
        var all = get("/api/transactions");
        assertThat(all.get("items").size()).isEqualTo(131);
        assertThat(all.get("categories").size()).isEqualTo(22);
        assertThat(all.get("items").get(0).get("id").asText()).isEqualTo("tx_0001");
        assertThat(all.get("items").get(130).get("recurring").asBoolean()).isFalse();
        var salary = get("/api/transactions?q=FORREST&category=Salary&type=income");
        assertThat(salary.get("items").size()).isEqualTo(3);
        assertThat(salary.get("total").asInt()).isEqualTo(131);
        assertThat(get("/api/transactions?q=B%C3%84CKEREI").get("items").size()).isEqualTo(6);
        for (String filter : new String[]{"q=no-such-booking", "category=unknown", "type=unknown", "q=Salary&type=expense"}) {
            var empty = get("/api/transactions?" + filter);
            assertThat(empty.get("items").size()).isZero();
            assertThat(empty.get("categories")).isEqualTo(all.get("categories"));
            assertThat(empty.get("total").asInt()).isEqualTo(131);
        }
    }
}
