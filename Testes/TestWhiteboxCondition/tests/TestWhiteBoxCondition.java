import com.es2.whiteboxconditions.Rating;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class TestWhiteBoxCondition {

    @AfterAll
    static void cleanup() {
        System.out.println("All tests finished!");
        End.main(new String[0]);
    }

    @Test
    public void testScoreTemperatureHotBothTrue() {
        Assertions.assertEquals("It's hot out, and so am I",
                new Rating().evaluateScoreTemperature(10, 35));
    }

    @Test
    public void testScoreTemperatureHotTempFalse() {
        assertEquals("I'm balanced",
                new Rating().evaluateScoreTemperature(10, 25));
    }

    @Test
    public void testScoreTemperatureBadMoodByLowScore() {
        assertEquals("I'm in a bad mood",
                new Rating().evaluateScoreTemperature(4, 25));
    }

    @Test
    public void testScoreTemperatureBadMoodByLowTemperature() {
        assertEquals("I'm in a bad mood",
                new Rating().evaluateScoreTemperature(6, 20));
    }

    @Test
    public void testDiscoAcceptedBothTrue() {
        assertEquals("Accepted",
                new Rating().evaluateIfCouldBeAcceptedAtDisco(9, 6));
    }

    @Test
    public void testDiscoDressStyleFalseTalkSkillTrue() {
        assertEquals("Not Accepted",
                new Rating().evaluateIfCouldBeAcceptedAtDisco(7, 6));
    }

    @Test
    public void testDiscoDressStyleTrueTalkSkillFalse() {
        assertEquals("Not Accepted",
                new Rating().evaluateIfCouldBeAcceptedAtDisco(9, 4));
    }

    public static class End {
        public static void main(String[] args) {
            Rating rating = new Rating();

            String result1 = rating.evaluateScoreTemperature(12, 36);
            System.out.println("Test 1: " + result1);

            String result2 = rating.evaluateScoreTemperature(3, 18);
            System.out.println("Test 2: " + result2);

            String result3 = rating.evaluateScoreTemperature(7, 25);
            System.out.println("Test 3: " + result3);

            String discoResult1 = rating.evaluateIfCouldBeAcceptedAtDisco(9, 6);
            System.out.println("Disco Test 1: " + discoResult1);

            String discoResult2 = rating.evaluateIfCouldBeAcceptedAtDisco(6, 4);
            System.out.println("Disco Test 2: " + discoResult2);
        }
    }
}