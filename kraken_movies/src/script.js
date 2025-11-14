const OMDB_API_KEY = 'bcf4371d';

const appState = {
    allMovies: [],
    currentFilter: 'all'
};

const GENRES_LIST = [
    'Action',
    'Adventure',
    'Sci-Fi',
    'Biography',
    'Drama',
    'History',
    'Crime',
    'Animation'
];


const imdbIds = [
    'tt31227572',
    'tt11378946',
    'tt0068646', // teste
    'tt0468569', // The Dark Knight
    'tt1375666', // Inception
    'tt0944947', // Game of Thrones
    'tt0110357', // The Lion King
    'tt4574334', // Stranger Things
    'tt0108778', // Friends
    'tt0076759',  // Star Wars
    'tt1312221', 

];

const temporadasData = {
    'tt0944947': [ // Game of Thrones
        { numero: 1, episodios: 10, ano: 2011 },{ numero: 2, episodios: 10, ano: 2012 },
        { numero: 3, episodios: 10, ano: 2013 },{ numero: 4, episodios: 10, ano: 2014 },
        { numero: 5, episodios: 10, ano: 2015 },{ numero: 6, episodios: 10, ano: 2016 },
        { numero: 7, episodios: 7, ano: 2017 },{ numero: 8, episodios: 6, ano: 2019 }
    ],
    'tt4574334': [ // Stranger Things
        { numero: 1, episodios: 8, ano: 2016 },{ numero: 2, episodios: 9, ano: 2017 },
        { numero: 3, episodios: 8, ano: 2019 },{ numero: 4, episodios: 9, ano: 2022 }
    ],
    'tt0108778': [ // Friends
        
        { numero: 2, episodios: 24, ano: 1995 },{ numero: 1, episodios: 24, ano: 1994 },
        { numero: 4, episodios: 24, ano: 1997 },{ numero: 3, episodios: 25, ano: 1996 },
        { numero: 5, episodios: 24, ano: 1998 },{ numero: 6, episodios: 25, ano: 1999 },
        { numero: 7, episodios: 24, ano: 2000 },{ numero: 8, episodios: 24, ano: 2001 },
        { numero: 9, episodios: 24, ano: 2002 },{ numero: 10, episodios: 18, ano: 2003 }
    ]
};

async function buscarFilmeOMDB(imdbId) {
    try {
        const resposta = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
        const dados = await resposta.json();
        
        if (dados.Response === 'False') {
            throw new Error(dados.Error);
        }
        
        let temporadas = [];
        if (dados.Type === 'series' && temporadasData[imdbId]) {
            temporadas = temporadasData[imdbId];
        }
        
        return {
            id: Date.now() + Math.random(),
            title: dados.Title,
            year: dados.Year.replace(/–.*/, ''),
            poster: dados.Poster !== 'N/A' ? dados.Poster : 'https://via.placeholder.com/300x450/2f2f2f/ffffff?text=Poster+Não+Disponível',
            rating: dados.imdbRating !== 'N/A' ? dados.imdbRating : '0.0',
            type: dados.Type === 'series' ? 'series' : (dados.Genre && (dados.Genre.includes('Animation') || dados.Genre.includes('Family')) ? 'kids' : 'movie'),
            description: dados.Plot || 'Sinopse não disponível',
            genres: dados.Genre || '',
            duration: dados.Runtime !== 'N/A' ? dados.Runtime : '',
            imdbId: imdbId,
            totalSeasons: dados.totalSeasons || (temporadas.length > 0 ? temporadas.length.toString() : 'N/A'),
            temporadas: temporadas
        };
    } catch (erro) {
        console.error('Erro ao buscar filme:', erro);
        return null;
    }
}

async function carregarFilmesDosIds() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.classList.remove('hidden');
    
    const filmesPromises = imdbIds.map(id => buscarFilmeOMDB(id));
    const filmes = await Promise.all(filmesPromises);
    
    appState.allMovies = filmes.filter(filme => filme !== null);
    
    if (loadingElement) loadingElement.classList.add('hidden');
    renderAll();
}

function openModal(id) {
    const m = appState.allMovies.find(x => x.id === id);
    if (!m) {
        console.log('Filme não encontrado com ID:', id);
        return;
    }
    
    if (m.type === 'series') {
        console.log('Abrindo série:', m.title);
        localStorage.setItem('selectedSeries', JSON.stringify(m));
        console.log('Dados salvos no localStorage');
        window.location.href = 'series-detail.html';
        return;
    }
    
    document.getElementById('modalTitle').textContent = m.title;
    document.getElementById('modalYear').textContent = m.year;
    document.getElementById('modalDescription').textContent = m.description;
    document.getElementById('modalPoster').src = m.poster;
    
    const extraInfo = document.getElementById('modalExtraInfo');
    if (extraInfo) {
        let extraHTML = '';
        if (m.genres) extraHTML += `<p><strong>Gêneros:</strong> ${m.genres}</p>`;
        if (m.duration) extraHTML += `<p><strong>Duração:</strong> ${m.duration}</p>`;
        if (m.rating && m.rating !== 'N/A') extraHTML += `<p><strong>Rating IMDb:</strong> ${m.rating}/10</p>`;
        extraInfo.innerHTML = extraHTML;
    }
    
    const watchLink = document.getElementById('watchLink');
    const tmdbLink = document.getElementById('tmdbLink');
    const imdbLink = document.getElementById('imdbLink');
    
    if (m.imdbId) {
        watchLink.href = 'construction.html';
        imdbLink.href = `https://www.imdb.com/title/${m.imdbId}`;
        tmdbLink.href = `https://www.imdb.com/title/${m.imdbId}`;
    }
    
    document.getElementById('movieModal').classList.remove('hidden');
}

function createCard(m) {
    return `<div class="category-movie-card" onclick="openModal(${m.id})">
        <img src="${m.poster}" class="category-movie-poster" alt="${m.title}">
        <div class="category-movie-info">
            <p class="category-movie-title">${m.title}</p>
            <p class="category-movie-year">${m.year}</p>
        </div>
    </div>`;
}

function getMoviesByGenre(genre) {
    return appState.allMovies.filter(m => 
        m.genres && m.genres.toLowerCase().includes(genre.toLowerCase())
    );
}

function createGenreSection(genre) {
    const movies = getMoviesByGenre(genre);
    if (movies.length === 0) return '';

    let html = `<div class="category-section">
        <h3 class="category-title">${genre}</h3>
        <div class="category-grid">`;

    movies.forEach(m => {
        html += createCard(m);
    });

    html += `</div></div>`;
    return html;
}

function renderGenres() {
    const container = document.getElementById('genreCategories');
    if (!container) return;

    const sections = GENRES_LIST
        .map(genre => createGenreSection(genre))
        .filter(html => html !== '');

    if (sections.length === 0) {
        container.innerHTML = '<p>Nenhum conteúdo encontrado para esses gêneros.</p>';
    } else {
        container.innerHTML = sections.join('');
    }
}


function getCategoryMovies(category, type) {
    const movies = appState.allMovies.filter(m => type === 'all' || m.type === type);
    const shuffled = [...movies].sort(() => Math.random() - 0.5);
    switch (category) {
        case 'releases':
    return shuffled
        .filter(m => Number(m.year) >= 2020)
        .sort((a, b) => b.year - a.year);
        case 'popular': return shuffled.sort((a,b)=>b.rating-a.rating);
        case 'classics': return shuffled.filter(m=>m.year<2000);
        case 'suggestions': return shuffled;
        case 'blockbusters': return shuffled.sort((a,b)=>b.rating-a.rating).slice(0,12);
        case 'collection': return shuffled.slice(0,12);
        default: return shuffled;
    }
}

function createCategorySection(title, id, type) {
    const movies = getCategoryMovies(id, type);
    if (movies.length === 0) return '';

    const sliderId = `slider-${id}-${type}`;

    let html = `
        <div class="category-section">
            <h3 class="category-title">${title}</h3>

            <div class="carousel-container">
                <button class="carousel-btn left" onclick="scrollCarousel('${sliderId}', -1)">&#10094;</button>

                <div id="${sliderId}" class="category-row carousel-row">
    `;

    movies.forEach(m => {
        html += createCard(m);
    });

    html += `
                </div>

                <button class="carousel-btn right" onclick="scrollCarousel('${sliderId}', 1)">&#10095;</button>
            </div>
        </div>
    `;

    return html;
}


function filterContent(filterType) {
    appState.currentFilter = filterType;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    
    if (filterType === 'all') {
        document.getElementById('moviesTab').classList.add('active-tab');
        document.getElementById('moviesCategories').innerHTML = createAllSection();
    } else if (filterType === 'genre') {
        // nova aba GENRE
        document.getElementById('genreTab').classList.add('active-tab');
        renderGenres();
    } else {
        document.getElementById(`${filterType}Tab`).classList.add('active-tab');
        renderCategories(filterType);
    }
}

function createAllSection() {
    const allMovies = appState.allMovies;
    if (allMovies.length === 0) return '<p>Nenhum filme carregado</p>';
    
    let html = `<div class="category-section"><h3 class="category-title">🎬 Todos os Conteúdos</h3><div class="category-grid">`;
    allMovies.forEach(m => html += createCard(m));
    html += `</div></div>`;
    
    return html;
}

function renderCategories(type) {
    const container = document.getElementById(`${type}Categories`);
    const titles = [
        '🎬 Lançamentos',
        '🔥 Mais Assistidos', 
        '⏳ Clássicos',
        '✨ Sugestões',
        '💰 Campeões de Bilheteria',
        '🎞️ Coletânea'
    ];
    const ids = ['releases','popular','classics','suggestions','blockbusters','collection'];
    
    container.innerHTML = titles.map((title, index) => {
        const contentType = type === 'movies' ? 'movie' : type;
        return createCategorySection(title, ids[index], contentType, false);
    }).join('');
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            location.reload();
            return;
        }
        
        const filteredMovies = appState.allMovies.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm) ||
            movie.genres.toLowerCase().includes(searchTerm) ||
            movie.year.includes(searchTerm)
        );
        
        if (filteredMovies.length === 0) {
            document.getElementById('noResults').classList.remove('hidden');
            document.querySelector('.content-section').classList.add('hidden');
        } else {
            document.getElementById('noResults').classList.add('hidden');
            document.querySelector('.content-section').classList.remove('hidden');
            appState.currentFilter = 'all';
            document.getElementById('moviesCategories').innerHTML = createSearchResults(filteredMovies);
        }
    }
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    searchInput.addEventListener('input', (e) => {
        if (e.target.value === '') {
            location.reload();
        }
    });
}

function createSearchResults(movies) {
    if (movies.length === 0) return '<p>Nenhum resultado encontrado</p>';
    
    let html = `<div class="category-section"><h3 class="category-title">🔍 Resultados da Pesquisa (${movies.length})</h3><div class="category-grid">`;
    movies.forEach(m => html += createCard(m));
    html += `</div></div>`;
    
    return html;
}

function setupPagination() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    
    let currentPage = 1;
    const moviesPerPage = 12;
    
    function updatePagination() {
        const totalMovies = appState.allMovies.length;
        const totalPages = Math.ceil(totalMovies / moviesPerPage);
        
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        
        if (totalMovies <= moviesPerPage) {
            document.getElementById('pagination').classList.add('hidden');
        } else {
            document.getElementById('pagination').classList.remove('hidden');
        }
        
        renderPaginatedMovies();
    }
    
    function renderPaginatedMovies() {
        const startIndex = (currentPage - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const paginatedMovies = appState.allMovies.slice(startIndex, endIndex);
        
        document.getElementById('moviesCategories').innerHTML = 
            `<div class="category-section">
                <h3 class="category-title">🎬 Todos os Conteúdos (Página ${currentPage})</h3>
                <div class="category-grid">
                    ${paginatedMovies.map(m => createCard(m)).join('')}
                </div>
            </div>`;
    }
    
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(appState.allMovies.length / moviesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
        }
    });
    
    updatePagination();
}

function renderAll() {
    filterContent('all');
    setupPagination(); 
}

function scrollCarousel(id, direction) {
    const row = document.getElementById(id);
    if (!row) return;

    const cardWidth = 200; 
    const scrollAmount = cardWidth * 3;

    row.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}


document.addEventListener('DOMContentLoaded', ()=>{
    carregarFilmesDosIds();
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterContent(filter);
        });
    });
    
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', ()=>{
            document.getElementById('movieModal').classList.add('hidden');
        });
    }
    
    setupSearch();
    setupPagination();
});