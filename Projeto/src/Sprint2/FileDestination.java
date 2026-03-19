package Sprint2;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class FileDestination implements LogDestination {
    private String filePath;
    private BufferedWriter writer;

    public FileDestination(String filePath) {
        this.filePath = filePath;
    }

    @Override
    public void open() {
        try {
            File file = new File(filePath);
            File parent = file.getParentFile();

            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }

            writer = new BufferedWriter(new FileWriter(file, true));
        } catch (IOException e) {
            System.out.println("Erro ao abrir ficheiro: " + e.getMessage());
        }
    }

    @Override
    public void write(String message) {
        if (writer == null) {
            System.out.println("Writer não inicializado.");
            return;
        }

        try {
            writer.write(message);
            writer.newLine();
        } catch (IOException e) {
            System.out.println("Erro ao escrever no ficheiro: " + e.getMessage());
        }
    }

    @Override
    public void close() {
        if (writer != null) {
            try {
                writer.close();
            } catch (IOException e) {
                System.out.println("Erro ao fechar ficheiro: " + e.getMessage());
            }
        }
    }
}