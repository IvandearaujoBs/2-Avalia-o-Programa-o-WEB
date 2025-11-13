const appState = {
    allMovies: [],
    currentFilter: 'all'
};

function getExampleMovies() {
    return [
        { id: 1, title: 'Inception', year: '2010', poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu1F8dT7NIrjG.jpg', type: 'movie', rating: '8.8' },
        { id: 1, title: 'Inception', year: '2010', poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu1F8dT7NIrjG.jpg', type: 'movie', rating: '8.8' },
        { id: 1, title: 'Inception', year: '2010', poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu1F8dT7NIrjG.jpg', type: 'movie', rating: '8.8' },
        { id: 2, title: 'The Dark Knight', year: '2008', poster: 'https://image.tmdb.org/t/p/w220_and_h330_face/4lj1ikfsSmMZNyfdi8R8Tv5tsgb.jpg', type: 'movie', rating: '9.0' },
        { id: 3, title: 'Toy Story', year: '1995', poster: 'https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSFDP3dO0lJo.jpg', type: 'kids', rating: '8.3' },
        { id: 4, title: 'Breaking Bad', year: '2008', poster: 'https://image.tmdb.org/t/p/w500/30erzlzIOtOK3k3T3BAl1GiVMP1.jpg', type: 'series', rating: '9.5' },
        { id: 5, title: 'The Matrix', year: '1999', poster: 'https://image.tmdb.org/t/p/w500/vgpXmVaVyXwC6NwxCZs2WMRrLn2.jpg', type: 'movie', rating: '8.7' },
        { id: 6, title: 'Avatar', year: '2009', poster: 'https://image.tmdb.org/t/p/w500/6ELCZBJHcNxIx3hy0gnVG2i7cRJ.jpg', type: 'movie', rating: '7.8' },
        { id: 7, title: 'Stranger Things', year: '2016', poster: 'https://image.tmdb.org/t/p/w500/x2lpQiKNzs2xCx6/5ub52Fq7d4Oa8QYZ6qJYlJA.jpg', type: 'series', rating: '8.7' },
        { id: 8, title: 'Game of Thrones', year: '2011', poster: 'https://image.tmdb.org/t/p/w500/u3bZgnEu2PAok7onSZJRfXS44qd.jpg', type: 'series', rating: '9.2' },
        { id: 9, title: 'Finding Nemo', year: '2003', poster: 'https://image.tmdb.org/t/p/w500/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg', type: 'kids', rating: '8.1' },
        { id: 10, title: 'The Shawshank Redemption', year: '1994', poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', type: 'movie', rating: '9.3' },
        { id: 11, title: 'The Mandalorian', year: '2019', poster: 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', type: 'series', rating: '8.8' },
        { id: 12, title: 'Frozen', year: '2013', poster: 'https://image.tmdb.org/t/p/w500/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg', type: 'kids', rating: '7.4' },
        { id: 13, title: 'Pulp Fiction', year: '1994', poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', type: 'movie', rating: '8.9' },
        { id: 14, title: 'The Crown', year: '2016', poster: 'https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg', type: 'series', rating: '8.6' },
        { id: 15, title: 'The Lion King', year: '1994', poster: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg', type: 'kids', rating: '8.5' }
    ];
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

function createCard(m) {
    return `<div class="category-movie-card" onclick="openModal(${m.id})">
        <img src="${m.poster}" class="category-movie-poster" alt="${m.title}">
        <div class="category-movie-info"><p class="category-movie-title">${m.title}</p><p class="category-movie-year">${m.year}</p></div></div>`;
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

function openModal(id) {
    const m = appState.allMovies.find(x => x.id === id);
    if (!m) return;
    document.getElementById('modalTitle').textContent = m.title;
    document.getElementById('modalYear').textContent = m.year;
    document.getElementById('modalDescription').textContent = m.type.toUpperCase();
    document.getElementById('modalPoster').src = m.poster;
    document.getElementById('movieModal').classList.remove('hidden');
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
    appState.allMovies = getExampleMovies();
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterContent(filter);
        });
    });
    
    document.querySelector('.modal-close').addEventListener('click', ()=>{
        document.getElementById('movieModal').classList.add('hidden');
    });
    
    renderAll();
});