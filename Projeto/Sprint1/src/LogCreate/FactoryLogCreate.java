package LogCreate;

/*
Aqui é onde novos Logs vai estar a fábrica de criação, mas que vai para classes factory de cada um dos tipos de log,
assim basta criar duas novas classes e fica tudo a funcionar normalmente, sem ter de mexer em mais nada, o que é o princípio do Open/Closed

Poderiamos ter aqui uma forma dinâmica, mas para ser mais simples e seguir os PDFs fica assim
*/

public abstract class FactoryLogCreate {
    public abstract LogCreate createLogCreate(String log);
}
