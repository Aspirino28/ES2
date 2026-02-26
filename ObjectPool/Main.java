import com.es2.objectpool.ReusablePool;
import com.es2.objectpool.ObjectNotFoundException;
import com.es2.objectpool.PoolExhaustedException;

import java.net.HttpURLConnection;

public class Main {
    public static void main(String[] args) {
        try {
            ReusablePool pool = ReusablePool.getInstance();

            System.out.println("A adquirir conexão...");
            HttpURLConnection conn = pool.acquire();

            System.out.println("Response code: " + conn.getResponseCode());

            pool.release(conn);
            System.out.println("Conexão libertada com sucesso.");

        } catch (PoolExhaustedException e) {
            System.out.println("Pool esgotada.");
        } catch (ObjectNotFoundException e) {
            System.out.println("Tentaste libertar uma conexão que não pertence à pool.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}