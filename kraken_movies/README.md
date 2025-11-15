# Kraken Movies – Catálogo Interativo de Filmes e Séries

Trabalho da disciplina **Programação Web** (UESPI – TSC, campus Parnaíba), ministrada pelo professor **Eyder Rios**. 

Aplicação web responsiva que consome a **API pública OMDb** para exibir um catálogo interativo de filmes e séries, com filtros, paginação, detalhes, temporadas e interface inspirada em plataformas de streaming.

---

## 👥 Integrantes da Equipe

- **Ivanildo Araújo**
- **Jefferson Melo**

(Os nomes também aparecem no rodapé da página principal.)

---

## 📂 Estrutura do Projeto

Raiz do repositório (`kraken_movies/`):

- `index.html` – página principal do catálogo (busca, filtros, carrosséis, modal de detalhes).
- `construction.html` – página de recurso em construção (usada pelo botão *Watch*).
- `src/`
  - `styles.css` – estilos gerais da aplicação (layout, carrosséis, modal, responsividade).
  - `header-styles.css` – estilos específicos do cabeçalho.
  - `script.js` – lógica principal do catálogo (fetch na API, filtros, carrosséis, modal, paginação, busca).
  - `series-detail.js` – lógica da página de detalhes de séries (temporadas/episódios).
  - `series-detail-styles.css` – estilos da página de detalhes de séries.
  - `image/` – logos, favicon e demais imagens.
- `.vscode/`, `.lh/` – arquivos de configuração/editor (Live Preview, ESLint, Prettier etc.).

> Obs.: na pasta `.lh/assets/styles` existem arquivos `*.json` gerados pelo ambiente de desenvolvimento (Live Server/Live Preview). Esses não são usados em produção, apenas durante o desenvolvimento.

---

## 🧠 Tecnologias Utilizadas

- **HTML5 semântico**
- **CSS3** (layout responsivo, carrosséis horizontais, modal, página em construção)
- **JavaScript ES6+** (sem frameworks)
- **Fetch API** para consumo da API OMDb
- **LocalStorage** para transportar dados de séries para a página `series-detail.html`

---

## 🌐 API Utilizada

- **OMDb API** – http://www.omdbapi.com  
  - Chave configurada em `script.js` na constante `OMDB_API_KEY`.
  - Uso do endpoint por ID IMDb:  
    `https://www.omdbapi.com/?i=<IMDB_ID>&apikey=<OMDB_API_KEY>`
  - Campos utilizados:
    - `Title`, `Year`, `Type`, `Poster`, `Genre`, `Runtime`, `imdbRating`, `Plot`, `totalSeasons`.

Além da API, o sistema gera links diretos para:

- Página do título no **IMDb**.
- (Por enquanto) o botão “Ver no TMDB” também aponta para o IMDb (link placeholder).

---

## 🎬 Visão Geral da Aplicação

### Página Principal (`index.html`)

- Cabeçalho com nome da aplicação e slogan.
- Campo de **busca** por título, ano ou gênero.
- Botões de filtro:
  - **ALL** – todos os conteúdos (com paginação).
  - **MOVIES** – apenas filmes.
  - **SERIES** – apenas séries.
  - **ANIMATION (kids)** – conteúdos com gênero *Animation* ou *Family*.
  - **GENRE** – visão agrupada por gênero (Action, Adventure, Sci-Fi, Biography, Drama, History, Crime, Animation).
- Seções/categorias para cada tipo:
  - 🎬 Lançamentos  
  - 🔥 Mais Assistidos  
  - ⏳ Clássicos  
  - ✨ Sugestões  
  - 💰 Campeões de Bilheteria  
  - 🎞️ Coletânea  

Cada categoria é exibida em um **carrossel horizontal** com rolagem lateral e botões ◀ ▶ para avançar/recuar um “pulo” fixo.

### Detalhes (Modal)

Ao clicar em um card:

- Se for **filme**: abre um **modal** com:
  - Poster em alta.
  - Título, ano.
  - Gêneros, duração, nota IMDb.
  - Sinopse (tratando textos longos).
  - Botões de ação:
    - Ver no IMDb
    - Ver no TMDB (placeholder)
    - Watch (leva para `construction.html`)

- Se for **série**:
  - Os dados são salvos em `localStorage` e o usuário é redirecionado para `series-detail.html`.

### Página de Detalhes de Série (`series-detail.html` + `series-detail.js`)

- Exibe:
  - Poster da série
  - Ano de estreia
  - Sinopse / informações principais
  - Nota/avaliação
- Traz uma seção de **temporadas**, baseada no objeto `temporadasData` em `script.js`, com:
  - Número da temporada
  - Quantidade de episódios
  - Ano
- Há uma listagem de episódios e botões de interação (assistir/voltar), de acordo com a lógica de `series-detail.js`.

### Página em Construção (`construction.html`)

- Usada como destino do botão **Watch**.
- Página estilizada com animação, barra de progresso e botão para voltar ao início.

---

### ⚙️Checklist de Requisitos

## Requisitos Funcionais (RF)

# 1.Exibir títulos lançados desde o início do ano corrente

Implementado como seção “🎬 Lançamentos”, filtrando filmes/séries recentes por ano (>= 2020).

Observação: o corte é fixo (2020), não baseado dinamicamente no ano corrente da máquina.


# 2.Paginação dos resultados

Implementada na aba ALL, com botões “Previous” e “Next”, 12 itens por página (setupPagination).

# 3.Filtro por gênero

Aba GENRE agrupa conteúdos pelos gêneros retornados pela API (Action, Adventure, Sci-Fi, etc.).

A busca também filtra por gênero usando movie.genres.

# 4.Página/Seção de detalhes (sinopse + rating)

Para filmes: modal com poster, ano, gêneros, duração, sinopse, rating IMDb.

Para séries: redirecionamento para series-detail.html com informações detalhadas.

# 5.Exibir temporadas e episódios quando houver

Dados de temporadas em temporadasData (Game of Thrones, Stranger Things, Friends, The Boys, etc.).

Exibidos na página de detalhes de série.

# 6.Lidar com campos ausentes

Poster genérico, sinopse padrão, nota 0.0, e fallback para runtime/genres quando ausentes

# 7,Tratar textos longos

Sinopse em área específica no modal com line-height confortável.

Títulos dos cards usam white-space: nowrap; overflow: hidden; text-overflow: ellipsis; para não quebrar layout.

# 8.Spinner de carregamento

Elemento #loading com .spinner, exibido durante carregarFilmesDosIds().

# 9. Tratamento de erros da API com mensagens amigáveis

try/catch em buscarFilmeOMDB.

Em caso de erro, o item é descartado e o console registra o problema.

Há um div#error estilizado para mensagens, mas ainda não está sendo preenchido explicitamente – tratamento parcial.

# 10.Página/Seção sobre os membros da equipe

Ainda não há uma página “Sobre a equipe” dedicada.

Os nomes da dupla aparecem no rodapé da página principal.

# 11.Interface clara, responsiva, intuitiva e bem elaborada

Layout limpo com cores consistentes, ícones/emojis nas seções, carrosséis estilo Netflix e media queries para tablets e celulares.

# 12. Rodapé com nomes dos autores

Implementado em index.html:
© 2025 Kraken Movies. Ivanildo Araújo e Jefferson Melo. TSC (UESPI-campus de Parnaíba)

## Requisitos Não Funcionais (RNF)

# 1. HTML5 semântico

Uso de <header>, <section>, <footer>, <div> organizados de forma lógica.

# 2. Responsividade (mobile-first)

Media queries para 768px e 480px; ajustes de grid e colunas; carrosséis funcionam bem em telas menores.

# 3. JavaScript modular

Código organizado em funções puras (buscarFilmeOMDB, renderCategories, renderGenres, etc.).

Toda a lógica ainda está em um único arquivo script.js (modularização por arquivos/ES Modules não foi utilizada).

# 4. Tratamento de exceções

try/catch no consumo da API.

Evita quebra da aplicação quando um título falha.

### Como Executar o Projeto Localmente

# 1. Clonar o repositório

git clone git@github.com:IvandearaujoBs/2-Avalia-o-Programa-o-WEB.git
cd 2-Avalia-o-Programa-o-WEB/kraken_movies

# 2. Abrir o projeto

Opção 1: abrir o arquivo index.html diretamente no navegador.

Opção 2 (recomendada): usar uma extensão como Live Server (VS Code) para servir a pasta kraken_movies.

# 3. Navegar pela aplicação

Usar os filtros (ALL, MOVIES, SERIES, ANIMATION, GENRE).

Clicar em um card para abrir o modal de detalhes.

Clicar em séries para abrir a página de temporadas.

Usar a busca para encontrar filmes/séries por título, ano ou gênero.

Testar a paginação na aba ALL.

## Repositório

GitHub: https://github.com/IvandearaujoBs/2-Avalia-o-Programa-o-WEB