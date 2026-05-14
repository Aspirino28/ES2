| ID    | Requisito / Regra   | Endpoint         | Nível   | Técnica                         | Resultado Esperado        | Pré-condições        |
|-------|---------------------|------------------|---------|---------------------------------|---------------------------|----------------------|
| TU-01 | Autenticação válida | POST /auth/login | Unidade | Particionamento de Equivalência | 200 + token JWT           | Utilizador válido    |
| TU-02 | Username inválido   | POST /auth/login | Unidade | Particionamento de Equivalência | 401 credenciais inválidas | Nenhuma              |
| TU-03 | Password inválida   | POST /auth/login | Unidade | Particionamento de Equivalência | 401 credenciais inválidas | Utilizador existente |
| TU-04 | Campos em falta     | POST /auth/login | Unidade | Valores Limite                  | 400 dados em falta        | Body vazio           |
| TU-05 | Username nulo       | POST /auth/login | Unidade | Valores Limite                  | 400 username inválido     | username = null      |
| TU-06 | Password nula       | POST /auth/login | Unidade | Valores Limite                  | 400 password inválida     | password = null      |
| TU-07 | Username vazio      | POST /auth/login | Unidade | Valores Limite                  | 400/401                   | username = ""        |
| TU-08 | Password vazia      | POST /auth/login | Unidade | Valores Limite                  | 400/401                   | password = ""        |
| TU-09 | Username em falta   | POST /auth/login | Unidade | Particionamento de Equivalência | 400 campo obrigatório     | sem username         |
| TU-10 | Password em falta   | POST /auth/login | Unidade | Particionamento de Equivalência | 400 campo obrigatório     | sem password         |
| TU-11 | Request inválido    | POST /auth/login | Unidade | Particionamento de Equivalência | 400 JSON inválido         | body mal formado     |
| TU-12 | Username e Password vazios   | POST /auth/login  | Unidade | Valores Limite / Combinação      | 400 dados inválidos / campos obrigatórios  | username = "" e password = ""







ID	Requisito / Regra	Endpoint	Nível	Técnica	Resultado Esperado	Pré-condições
TU-01	RF-01: autenticação de utilizador	POST /auth/login	Unidade	Particionamento de Equivalência	200 + token JWT válido	Utilizador válido em mock/stub; sem dependência de BD ou rede
TU-02	RF-01: autenticação – username inválido	POST /auth/login	Unidade	Particionamento de Equivalência	401 credenciais inválidas	Username inexistente passado como parâmetro; sem pré-condições de BD
TU-03	RF-01: autenticação – password inválida	POST /auth/login	Unidade	Particionamento de Equivalência	401 credenciais inválidas	Utilizador existente em mock; password errada passada como parâmetro
TU-04	RN-XX: campos obrigatórios no login	POST /auth/login	Unidade	Valores Limite	400 dados em falta	Body completamente vazio enviado ao validador interno
TU-05	RN-XX: campos obrigatórios – username nulo	POST /auth/login	Unidade	Valores Limite	400 username inválido	username = null passado diretamente ao validador; password válida em mock
TU-06	RN-XX: campos obrigatórios – password nula	POST /auth/login	Unidade	Valores Limite	400 password inválida	password = null passado diretamente ao validador; username válido em mock
TU-07	RN-XX: campos obrigatórios – username vazio	POST /auth/login	Unidade	Valores Limite	400/401	username = "" (string vazia); password válida em mock
TU-08	RN-XX: campos obrigatórios – password vazia	POST /auth/login	Unidade	Valores Limite	400/401	password = "" (string vazia); username válido em mock
TU-09	RN-XX: ausência de username	POST /auth/login	Unidade	Particionamento de Equivalência	400 campo obrigatório	Body sem chave username; validador isolado sem BD
TU-10	RN-XX: ausência de password	POST /auth/login	Unidade	Particionamento de Equivalência	400 campo obrigatório	Body sem chave password; validador isolado sem BD
TU-11	RN-XX: validação de formato do request	POST /auth/login	Unidade	Particionamento de Equivalência	400 JSON inválido	Body mal formado (JSON corrompido) enviado ao parser interno
TU-12	RN-XX: combinação de campos vazios	POST /auth/login	Unidade	Condições Múltiplas (username = "", password = "")	400 campos obrigatórios inválidos	username = "" e password = "" em simultâneo; validador isolado
TU-13	RN-XX: segurança – injeção no input	POST /auth/login	Unidade	Particionamento de Equivalência	400/401 sem execução de código	username = ' OR '1'='1; validador de sanitização isolado
TU-14	RN-XX: rate limiting / tentativas excessivas	POST /auth/login	Unidade	Valores Limite (N-1, N, N+1 tentativas)	429 Too Many Requests a partir do limite N	Contador de tentativas em mock; sem BD
TU-15	RN-XX: comprimento máximo de username	POST /auth/login	Unidade	Valores Limite (limite-1, limite, limite+1 chars)	400 input inválido para limite+1	Strings geradas programaticamente no setup do teste