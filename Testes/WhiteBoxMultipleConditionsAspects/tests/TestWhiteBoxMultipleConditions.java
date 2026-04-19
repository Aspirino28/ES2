import java.io.File;
import java.util.ArrayList;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import com.es2.multipleconditions.CourseUtils;
import com.es2.multipleconditions.DriveUtils;
import com.es2.multipleconditions.ListUtils;
import com.es2.multipleconditions.Marks;
import com.es2.multipleconditions.Person;
import com.es2.multipleconditions.PersonCannotDriveException;

public class TestWhiteBoxMultipleConditions {
    @AfterAll
    public static void tearDownAfterClass() {
        End e = new End();
    }

    @Test
    public void testDriveTT_AgeMinor_PersonNotNull() {
        Person p = new Person("John", 15);
        Assertions.assertThrows(PersonCannotDriveException.class, 
            () -> DriveUtils.assertConditionsToDrive(p),
            "Deve lançar exceção quando age < 18 e p != null");
    }

    @Test
    public void testDriveTF_AgeMinor_PersonNull() {
        Person p = null;
        Assertions.assertThrows(NullPointerException.class,
            () -> DriveUtils.assertConditionsToDrive(p),
            "Deve lançar NullPointerException quando p == null (bug no código)");
    }

    @Test
    public void testDriveFT_AgeAdult_PersonNotNull() {
        Person p = new Person("John", 20);
        Assertions.assertDoesNotThrow(
            () -> DriveUtils.assertConditionsToDrive(p),
            "Não deve lançar exceção quando age >= 18 e p != null");
    }

    @Test
    public void testDriveFF_AgeAdult_PersonNull() {
        Person p = new Person("John", 25);
        Assertions.assertDoesNotThrow(
            () -> DriveUtils.assertConditionsToDrive(p),
            "Não deve lançar exceção quando age >= 18");
    }

    @Test
    public void testApproveTTT() {
        Marks marks = new Marks(10, 0.7f, 10);
        boolean approved = CourseUtils.approved(marks);
        Assertions.assertTrue(approved, "Deve ser aprovado quando todas as condições são verdadeiras");
    }

    @Test
    public void testApproveTTF() {
        Marks marks = new Marks(9, 0.7f, 10);
        boolean approved = CourseUtils.approved(marks);
        Assertions.assertFalse(approved, "Deve ser reprovado quando writtenTest < 9.5");
    }

    @Test
    public void testApproveTFT() {
        Marks marks = new Marks(10, 0.7f, 9);
        boolean approved = CourseUtils.approved(marks);
        Assertions.assertFalse(approved, "Deve ser reprovado quando work < 10");
    }

    @Test
    public void testApproveTFF() {
        Marks marks = new Marks(9, 0.7f, 9);
        boolean approved = CourseUtils.approved(marks);
        Assertions.assertFalse(approved, "Deve ser reprovado quando work < 10 e writtenTest < 9.5");
    }

    @Test
    public void testApproveFTT() {
        Marks marks = new Marks(10, 0.5f, 10);
        boolean approved = CourseUtils.approved(marks);
        Assertions.assertFalse(approved, "Deve ser reprovado quando attendance <= 0.66");
    }

    @Test
    public void testApproveFTF() {
        Marks marks = new Marks(9, 0.5f, 10);
        boolean approved = CourseUtils.approved(marks);
        Assertions.assertFalse(approved, "Deve ser reprovado quando attendance <= 0.66 e writtenTest < 9.5");
    }

    @Test
    public void testApproveFFT() {
        Marks marks = new Marks(10, 0.5f, 9);
        boolean approved = CourseUtils.approved(marks);
        Assertions.assertFalse(approved, "Deve ser reprovado quando attendance <= 0.66 e work < 10");
    }

    @Test
    public void testApproveFFFF() {
        Marks marks = new Marks(9, 0.5f, 9);
        boolean approved = CourseUtils.approved(marks);
        Assertions.assertFalse(approved, "Deve ser reprovado quando todas as condições são falsas");
    }

        @Test
        public void testFindNameTT() {
            ArrayList<String> list = new ArrayList<>();
            list.add("John");
            list.add("Jane");
            int result = ListUtils.findName(list, "Jane");
            Assertions.assertEquals(1, result, "Deve encontrar Jane no índice 1 (continuou procurando)");
        }

    @Test
    public void testFindNameTF() {
        ArrayList<String> list = new ArrayList<>();
        list.add("John");
        int result = ListUtils.findName(list, "John");
        Assertions.assertEquals(0, result, "Deve encontrar o nome no índice 0");
    }

    @Test
    public void testFindNameFT() {
        ArrayList<String> list = new ArrayList<>();
        list.add("John");
        System.out.println("Lista: " + list);
        int result = ListUtils.findName(list, "Ze");
        Assertions.assertEquals(-1, result, "Deve retornar -1 quando não encontra (fora dos limites)");
    }

    @Test
    public void testFindNameFF() {
        ArrayList<String> list = new ArrayList<>();
        list.add("John");
        list.add("Jane");
        int result = ListUtils.findName(list, "Ze");
        Assertions.assertEquals(-1, result, "Deve retornar -1 quando não encontra após percorrer todo o array");
    }

    public static class End {

        public End() {
            File f = new File("runningTest.tmp");
            f.delete();
        }
    }
}
