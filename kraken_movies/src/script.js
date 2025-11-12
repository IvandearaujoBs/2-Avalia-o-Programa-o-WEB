
const API_CONFIG = {
    baseURL: 'https://api.embedmovies.org/api',
};

const appState = {
    currentPage: 1,
    itemsPerPage: 20,
    allMovies: [],
    filteredMovies: [],
    currentFilter: 'all',
    searchQuery: '',
    isLoading: false
};

const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    moviesGrid: document.getElementById('moviesGrid'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    noResults: document.getElementById('noResults'),
    pagination: document.getElementById('pagination'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    pageInfo: document.getElementById('pageInfo'),
    modal: document.getElementById('movieModal'),
    modalClose: document.querySelector('.modal-close')
};

/**
 * 
 * @param {string} query 
 * @returns {Promise<Array>} 
 */
async function searchMovies(query) {
    try {
        showLoading(true);
        hideError();
        const movies = await fetchMoviesFromEmbedAPI(query);

        appState.allMovies = movies;
        appState.currentPage = 1;
        filterMovies();
        displayMovies();

    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        showError('Erro ao buscar filmes. Tente novamente mais tarde.');
    } finally {
        showLoading(false);
    }
}

/**
 * 
 * @param {string} query 
 * @returns {Promise<Array>}
 */
async function fetchMoviesFromEmbedAPI(query) {
    try {
        const endpoints = [
            `https://embedmovies.org/api/search?q=${encodeURIComponent(query)}`,
            `https://api.embedmovies.org/search?q=${encodeURIComponent(query)}`,
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // Adicione headers necessários aqui
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    return formatMoviesData(data);
                }
            } catch (e) {
                console.log(`Endpoint ${endpoint} não disponível`);
            }
        }

        // Se nenhum endpoint funcionar, retorne dados de exemplo
        return getExampleMovies(query);

    } catch (error) {
        console.error('Erro ao conectar com API:', error);
        return getExampleMovies(query);
    }
}

/**
 * Formata dados da API para o formato esperado
 * @param {Object} data - Dados da API
 * @returns {Array}
 */
function formatMoviesData(data) {
    // Adapte esta função conforme o formato da resposta da API
    if (Array.isArray(data)) {
        return data.map(item => ({
            id: item.id || item.imdbId || Math.random(),
            title: item.title || item.name || 'Sem título',
            year: item.year || item.releaseDate?.split('-')[0] || 'N/A',
            poster: item.poster || item.posterPath || '/placeholder.jpg',
            description: item.description || item.overview || '',
            type: item.type || (item.mediaType === 'tv' ? 'series' : 'movie'),
            imdbId: item.imdbId || item.imdbID || '',
            tmdbId: item.tmdbId || item.id || '',
            rating: item.rating || item.voteAverage || 'N/A'
        }));
    }
    return [];
}

/**
 * Retorna filmes de exemplo para demonstração
 * @param {string} query - Termo de busca
 * @returns {Array}
 */
function getExampleMovies(query) {
    const allExamples = [
        {
            id: 1,
            title: 'Inception',
            year: '2010',
            poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu1F8dT7NIrjG.jpg',
            description: 'Um ladrão que rouba segredos corporativos através da tecnologia de compartilhamento de sonhos recebe a tarefa inversa de plantar uma ideia.',
            type: 'movie',
            imdbId: 'tt1375666',
            tmdbId: '27205',
            rating: '8.8'
        },
        {
            id: 2,
            title: 'The Dark Knight',
            year: '2008',
            poster: 'https://image.tmdb.org/t/p/w220_and_h330_face/4lj1ikfsSmMZNyfdi8R8Tv5tsgb.jpg',
            description: 'Quando a ameaça conhecida como o Coringa causa estragos e caos no povo de Gotham, Batman deve aceitar um dos testes psicológicos e físicos.',
            type: 'movie',
            imdbId: 'tt0468569',
            tmdbId: '155',
            rating: '9.0'
        },
        {
            id: 3,
            title: 'Breaking Bad',
            year: '2008',
            poster: 'https://image.tmdb.org/t/p/w220_and_h330_face/30erzlzIOtOK3k3T3BAl1GiVMP1.jpg',
            description: 'Um professor de química desempregado diagnosticado com câncer terminal se une a um ex-aluno de meth para garantir o futuro de sua família.',
            type: 'series',
            imdbId: 'tt0903747',
            tmdbId: '1396',
            rating: '9.5'
        },
        {
            id: 4,
            title: 'Interstellar',
            year: '2014',
            poster: 'https://image.tmdb.org/t/p/w220_and_h330_face/6ricSDD83BClJsFdGB6x7cM0MFQ.jpg',
            description: 'Um grupo de astronautas viaja através de um buraco de minhoca no espaço na tentativa de garantir a sobrevivência da humanidade.',
            type: 'movie',
            imdbId: 'tt0816692',
            tmdbId: '157336',
            rating: '8.6'
        },
        {
            id: 5,
            title: 'Stranger Things',
            year: '2016',
            poster: 'https://image.tmdb.org/t/p/w500/x2lpQiKNzs2xCx6/5ub52Fq7d4Oa8QYZ6qJYlJA.jpg',
            description: 'Quando um menino desaparece, seus amigos, sua família e a polícia local devem lidar com forças estranhas e mistérios secretos.',
            type: 'series',
            imdbId: 'tt4574334',
            tmdbId: '66732',
            rating: '8.7'
        },
        {
            id: 6,
            title: 'Pulp Fiction',
            year: '1994',
            poster: 'https://image.tmdb.org/t/p/w500/d5iIlW_szoE486cd4MKAdOvxA4t.jpg',
            description: 'A vida de vários criminosos de Los Angeles se entrelaça em quatro histórias de violência e redenção.',
            type: 'movie',
            imdbId: 'tt0110912',
            tmdbId: '680',
            rating: '8.9'
        }
    ];

    // Filtra baseado na query
    if (!query) return allExamples;

    return allExamples.filter(movie =>
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.description.toLowerCase().includes(query.toLowerCase())
    );
}

// ============================================
// Funções de Filtro e Exibição
// ============================================

/**
 * Filtra filmes baseado no tipo selecionado
 */
function filterMovies() {
    appState.filteredMovies = appState.allMovies.filter(movie => {
        if (appState.currentFilter === 'all') return true;
        if (appState.currentFilter === 'movies') return movie.type === 'movie';
        if (appState.currentFilter === 'series') return movie.type === 'series';
        return true;
    });
}

/**
 * Exibe os filmes na página
 */
function displayMovies() {
    const startIndex = (appState.currentPage - 1) * appState.itemsPerPage;
    const endIndex = startIndex + appState.itemsPerPage;
    const moviesToDisplay = appState.filteredMovies.slice(startIndex, endIndex);

    if (moviesToDisplay.length === 0) {
        elements.moviesGrid.innerHTML = '';
        elements.noResults.classList.remove('hidden');
        elements.pagination.classList.add('hidden');
        return;
    }

    elements.noResults.classList.add('hidden');
    elements.moviesGrid.innerHTML = moviesToDisplay.map(movie => createMovieCard(movie)).join('');

    // Adiciona event listeners aos cards
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => {
            const movieId = card.dataset.movieId;
            const movie = appState.allMovies.find(m => m.id == movieId);
            if (movie) openModal(movie);
        });
    });

    updatePagination();
}

/**
 * Cria o HTML de um card de filme
 * @param {Object} movie - Dados do filme
 * @returns {string}
 */
function createMovieCard(movie) {
    const typeLabel = movie.type === 'series' ? 'Série' : 'Filme';
    return `
        <div class="movie-card" data-movie-id="${movie.id}">
            <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22300%22%3E%3Crect fill=%22%23404040%22 width=%22200%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2216%22 fill=%22%23888%22%3ESem Imagem%3C/text%3E%3C/svg%3E'">
            <div class="movie-overlay">
                <button class="overlay-btn">Ver Detalhes</button>
            </div>
            <div class="movie-info">
                <h3 class="movie-title" title="${movie.title}">${movie.title}</h3>
                <p class="movie-year">${movie.year} • ${typeLabel}</p>
                ${movie.rating !== 'N/A' ? `<span class="movie-rating">⭐ ${movie.rating}</span>` : ''}
            </div>
        </div>
    `;
}

/**
 * Atualiza os controles de paginação
 */
function updatePagination() {
    const totalPages = Math.ceil(appState.filteredMovies.length / appState.itemsPerPage);

    if (totalPages <= 1) {
        elements.pagination.classList.add('hidden');
        return;
    }

    elements.pagination.classList.remove('hidden');
    elements.pageInfo.textContent = `Página ${appState.currentPage} de ${totalPages}`;
    elements.prevBtn.disabled = appState.currentPage === 1;
    elements.nextBtn.disabled = appState.currentPage === totalPages;
}

// ============================================
// Modal
// ============================================

/**
 * Abre o modal com detalhes do filme
 * @param {Object} movie - Dados do filme
 */
function openModal(movie) {
    document.getElementById('modalTitle').textContent = movie.title;
    document.getElementById('modalYear').textContent = `${movie.year} • ${movie.type === 'series' ? 'Série' : 'Filme'}`;
    document.getElementById('modalDescription').textContent = movie.description;
    document.getElementById('modalPoster').src = movie.poster;

    // Links para TMDB e IMDb
    if (movie.tmdbId) {
        document.getElementById('tmdbLink').href = `https://www.themoviedb.org/${movie.type === 'series' ? 'tv' : 'movie'}/${movie.tmdbId}`;
    }

    if (movie.imdbId) {
        document.getElementById('imdbLink').href = `https://www.imdb.com/title/${movie.imdbId}/`;
    }

    // Link para assistir (usando EmbedMovies)
    if (movie.imdbId) {
        document.getElementById('watchLink').href = `https://embedmovies.org/?s=${encodeURIComponent(movie.title)}`;
    } else {
        document.getElementById('watchLink').href = `https://embedmovies.org/?s=${encodeURIComponent(movie.title)}`;
    }

    elements.modal.classList.remove('hidden');
}

/**
 * Fecha o modal
 */
function closeModal() {
    elements.modal.classList.add('hidden');
}

// ============================================
// Utilitários
// ============================================

/**
 * Mostra/esconde o spinner de carregamento
 * @param {boolean} show
 */
function showLoading(show) {
    if (show) {
        elements.loading.classList.remove('hidden');
    } else {
        elements.loading.classList.add('hidden');
    }
}

/**
 * Mostra mensagem de erro
 * @param {string} message
 */
function showError(message) {
    elements.error.textContent = message;
    elements.error.classList.remove('hidden');
}

/**
 * Esconde mensagem de erro
 */
function hideError() {
    elements.error.classList.add('hidden');
}

// ============================================
// Event Listeners
// ============================================

// Busca ao clicar no botão
elements.searchBtn.addEventListener('click', () => {
    appState.searchQuery = elements.searchInput.value.trim();
    if (appState.searchQuery) {
        searchMovies(appState.searchQuery);
    }
});

// Busca ao pressionar Enter
elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        elements.searchBtn.click();
    }
});

// Filtros
elements.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        elements.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        appState.currentFilter = btn.dataset.filter;
        appState.currentPage = 1;
        filterMovies();
        displayMovies();
    });
});

// Paginação
elements.prevBtn.addEventListener('click', () => {
    if (appState.currentPage > 1) {
        appState.currentPage--;
        displayMovies();
        window.scrollTo(0, 0);
    }
});

elements.nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(appState.filteredMovies.length / appState.itemsPerPage);
    if (appState.currentPage < totalPages) {
        appState.currentPage++;
        displayMovies();
        window.scrollTo(0, 0);
    }
});

// Modal
elements.modalClose.addEventListener('click', closeModal);
elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) closeModal();
});

// ============================================
// Inicialização
// ============================================

// Carrega filmes de exemplo ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    appState.allMovies = getExampleMovies('');
    filterMovies();
    displayMovies();
});