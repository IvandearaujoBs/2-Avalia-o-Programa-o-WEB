const OMDB_API_KEY = 'bcf4371d';

const appState = {
    allMovies: [],
    currentFilter: 'all'
};

const GENRES_LIST = [
    'Action','Adventure','Sci-Fi','Biography','Drama','History','Crime','Animation'
];

const imdbIds = [
    'tt31227572','tt11378946','tt0068646','tt0468569','tt1375666', 'tt0944947','tt0110357', 'tt4574334', 'tt0108778', 
    'tt5311514', 'tt1312221', 'tt0169547', 'tt26581740', 'tt1262426', 'tt5626028', 'tt1190634', 'tt7286456', 'tt12637874', 
    'tt0120737', 'tt0245429', 'tt0088763', 'tt0076759', 'tt0095327', 'tt2948356', 'tt1355642', 'tt0096697',  
    'tt36463894', 'tt9362722', 'tt29623480', 'tt30472557', 'tt26443597', 'tt30017619', 'tt0498396', 'tt0107688', 'tt0382932',
    'tt0126029', 'tt0121164', 'tt32376165', 'tt10676052', 'tt9362736', 'tt0111161', 'tt0050083', 'tt0108052'
];

const temporadasData = {
    'tt0944947': [
        { numero: 1, episodios: 10, ano: 2011 },{ numero: 2, episodios: 10, ano: 2012 },
        { numero: 3, episodios: 10, ano: 2013 },{ numero: 4, episodios: 10, ano: 2014 },
        { numero: 5, episodios: 10, ano: 2015 },{ numero: 6, episodios: 10, ano: 2016 },
        { numero: 7, episodios: 7, ano: 2017 },{ numero: 8, episodios: 6, ano: 2019 }
    ],
    'tt4574334': [
        { numero: 1, episodios: 8, ano: 2016 },{ numero: 2, episodios: 9, ano: 2017 },
        { numero: 3, episodios: 8, ano: 2019 },{ numero: 4, episodios: 9, ano: 2022 }
    ],
    'tt0108778': [
        { numero: 1, episodios: 24, ano: 1994 },{ numero: 2, episodios: 24, ano: 1995 },
        { numero: 3, episodios: 25, ano: 1996 },{ numero: 4, episodios: 24, ano: 1997 },
        { numero: 5, episodios: 24, ano: 1998 },{ numero: 6, episodios: 25, ano: 1999 },
        { numero: 7, episodios: 24, ano: 2000 },{ numero: 8, episodios: 24, ano: 2001 },
        { numero: 9, episodios: 24, ano: 2002 },{ numero: 10, episodios: 18, ano: 2003 }
    ],
        'tt1190634': [
        { numero: 1, episodios: 8, ano: 2019 },
        { numero: 2, episodios: 8, ano: 2020 },
        { numero: 3, episodios: 8, ano: 2022 },
        { numero: 4, episodios: 8, ano: 2024 },
    ],
        'tt12637874': [
        { numero: 1, episodios: 8, ano: 2019 },
        { numero: 2, episodios: 8, ano: 2020 },
        { numero: 3, episodios: 8, ano: 2022 },
        { numero: 4, episodios: 8, ano: 2024 },
    ]
};

async function buscarFilmeOMDB(imdbId) {
    try {
        const url = `https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${encodeURIComponent(OMDB_API_KEY)}`;
        const resposta = await fetch(url);

        if (!resposta.ok) {
            const txt = await resposta.text().catch(() => '(sem corpo)');
            throw new Error(`HTTP ${resposta.status} - ${txt}`);
        }

        const contentType = (resposta.headers.get('content-type') || '').toLowerCase();
        const bodyText = await resposta.text().catch(() => '');

        if (!contentType.includes('application/json')) {
            console.warn('Resposta OMDB não é JSON para imdbId=', imdbId, ' — corpo:', bodyText);
            throw new Error('Resposta OMDB inválida (não JSON)');
        }

        let dados;
        try {
            dados = JSON.parse(bodyText);
        } catch (parseErr) {
            console.error('Erro ao parsear JSON da resposta OMDB para imdbId=', imdbId, parseErr, 'corpo:', bodyText);
            const errorMatch = bodyText.match(/"Response"\s*:\s*"False"[\s\S]*?"Error"\s*:\s*"(.*)"/);
            if (errorMatch) {
                dados = { Response: 'False', Error: errorMatch[1] };
            } else {
                throw parseErr;
            }
        }

        if (dados.Response === 'False') {
            throw new Error(dados.Error || 'OMDB retornou Response=false');
        }
        
        let temporadas = [];
        if (dados.Type === 'series' && temporadasData[imdbId]) {
            temporadas = temporadasData[imdbId].sort((a, b) => a.numero - b.numero); 
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
        tmdbLink.href = `https://www.themoviedb.org/title/${m.tmdbId}`; 
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
        case 'classics': return shuffled.filter(m=>m.year<2010);
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

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-filter="${filterType}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    else console.warn('Botão de filtro não encontrado para:', filterType);
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active-tab');
        tab.style.display = 'none';
    });

    let tabId = (filterType === 'all') ? 'moviesTab' : (filterType === 'genre' ? 'genreTab' : `${filterType}Tab`);
    const tabEl = document.getElementById(tabId);
    if (tabEl) {
        tabEl.classList.add('active-tab');
        tabEl.style.display = 'block';
        const contentSection = document.querySelector('.content-section');
        if (contentSection) contentSection.classList.remove('hidden');
        try { tabEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
        console.log('filterContent activated tab:', tabId, 'classes:', tabEl.className);
    } else {
        console.warn('Elemento de tab não encontrado:', tabId);
    }

    if (filterType === 'all') {
        currentPage = 1;
        renderPaginatedMovies();
        updatePagination();
    } else if (filterType === 'genre') {
        renderGenres();
        const pagination = document.getElementById('pagination'); if (pagination) pagination.classList.add('hidden');
    } else {
        renderCategories(filterType);
        const pagination = document.getElementById('pagination'); if (pagination) pagination.classList.add('hidden');
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
            
            document.getElementById('moviesTab').classList.add('active-tab'); 
            
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

let currentPage = 1; 
const moviesPerPage = 12;

function updatePagination() {
    const totalMovies = appState.allMovies.length;
    const totalPages = Math.ceil(totalMovies / moviesPerPage);
    
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) return;

    if (appState.currentFilter !== 'all' || totalMovies <= moviesPerPage) { 
        paginationElement.classList.add('hidden');
        return;
    }
    
    paginationElement.classList.remove('hidden');
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    renderPaginatedMovies();
}

function renderPaginatedMovies() {
    if (appState.currentFilter !== 'all') return; 
    
    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    const paginatedMovies = appState.allMovies.slice(startIndex, endIndex);
    
    document.getElementById('moviesCategories').innerHTML = 
        `<div class="category-section">
            <h3 class="category-title">🎬 Todos os Conteúdos</h3>
            <div class="category-grid">
                ${paginatedMovies.map(m => createCard(m)).join('')}
            </div>
        </div>`;
}

function setupPagination() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    function handlePrevClick() {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    }
    
    function handleNextClick() {
        const totalPages = Math.ceil(appState.allMovies.length / moviesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
        }
    }
    
    if (prevBtn) {
        prevBtn.removeEventListener('click', handlePrevClick);
        prevBtn.addEventListener('click', handlePrevClick);
    }
    if (nextBtn) {
        nextBtn.removeEventListener('click', handleNextClick);
        nextBtn.addEventListener('click', handleNextClick);
    }
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
            btn.addEventListener('click', (e) => {
                const filter = btn.getAttribute('data-filter');
                console.log('Filtro selecionado:', filter, 'botão:', e.currentTarget);
                currentPage = 1; 
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
});