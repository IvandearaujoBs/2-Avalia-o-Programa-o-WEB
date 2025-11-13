const OMDB_API_KEY = 'bcf4371d';

const appState = {
    allMovies: [],
    currentFilter: 'all'
};

const imdbIds = [
    'tt0468569', // The Dark Knight
    'tt1375666', // Inception
    'tt0944947', // Game of Thrones
    'tt0110357', // The Lion King
    'tt4574334', // Stranger Things
    'tt0108778', // Friends
    'tt0076759'  // Star Wars
];

async function buscarFilmeOMDB(imdbId) {
    try {
        const resposta = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
        const dados = await resposta.json();
        
        if (dados.Response === 'False') {
            throw new Error(dados.Error);
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
            imdbId: imdbId
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
        watchLink.href = `https://playerflixapi.com/filme/${m.imdbId}`;
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

function getCategoryMovies(category, type) {
    const movies = appState.allMovies.filter(m => type === 'all' || m.type === type);
    const shuffled = [...movies].sort(() => Math.random() - 0.5);
    switch (category) {
        case 'releases': return shuffled.sort((a,b)=>b.year-a.year);
        case 'popular': return shuffled.sort((a,b)=>b.rating-a.rating);
        case 'classics': return shuffled.filter(m=>m.year<2000);
        case 'suggestions': return shuffled;
        case 'blockbusters': return shuffled.sort((a,b)=>b.rating-a.rating).slice(0,12);
        case 'collection': return shuffled.slice(0,12);
        default: return shuffled;
    }
}

function createCategorySection(title, id, type, isAllSection = false) {
    const movies = getCategoryMovies(id, type);
    if (movies.length === 0) return '';
    
    const visible = movies.slice(0,6);
    const hidden = movies.slice(6);
    
    let html = `<div class="category-section"><h3 class="category-title">${title}</h3><div class="category-grid">`;
    
    if (isAllSection) {
        movies.forEach(m => html += createCard(m));
        html += `</div></div>`;
    } else {
        visible.forEach(m => html += createCard(m));
        html += `</div>`;
        
        if (hidden.length > 0) {
            html += `<div id="hidden-${id}-${type}" class="hidden-content" style="display:none"><div class="category-grid">`;
            hidden.forEach(m => html += createCard(m));
            html += `</div></div><button class="show-more-btn" onclick="toggleCategory('${id}-${type}',${hidden.length})">Mostrar Mais (${hidden.length})</button>`;
        }
        html += `</div>`;
    }
    return html;
}

function toggleCategory(id, count) {
    const block = document.getElementById(`hidden-${id}`);
    const btn = event.target;
    if (block.style.display === 'none') {
        block.style.display = 'block';
        btn.textContent = 'Mostrar Menos';
    } else {
        block.style.display = 'none';
        btn.textContent = `Mostrar Mais (${count})`;
    }
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

function renderAll() {
    filterContent('all');
}

document.addEventListener('DOMContentLoaded', ()=>{
    carregarFilmesDosIds();
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterContent(filter);
        });
    });
    
    document.querySelector('.modal-close').addEventListener('click', ()=>{
        document.getElementById('movieModal').classList.add('hidden');
    });
});