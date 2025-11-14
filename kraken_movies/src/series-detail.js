const temporadasData = {
    'tt0944947': [ // Game of Thrones
        { numero: 1, episodios: 10, ano: 2011 },
        { numero: 2, episodios: 10, ano: 2012 },
        { numero: 3, episodios: 10, ano: 2013 },
        { numero: 4, episodios: 10, ano: 2014 },
        { numero: 5, episodios: 10, ano: 2015 },
        { numero: 6, episodios: 10, ano: 2016 },
        { numero: 7, episodios: 7, ano: 2017 },
        { numero: 8, episodios: 6, ano: 2019 }
    ],
    'tt4574334': [ // Stranger Things
        { numero: 1, episodios: 8, ano: 2016 },
        { numero: 2, episodios: 9, ano: 2017 },
        { numero: 3, episodios: 8, ano: 2019 },
        { numero: 4, episodios: 9, ano: 2022 }
    ],
    'tt0108778': [ // Friends
        { numero: 1, episodios: 24, ano: 1994 },
        { numero: 2, episodios: 24, ano: 1995 },
        { numero: 3, episodios: 25, ano: 1996 },
        { numero: 4, episodios: 24, ano: 1997 },
        { numero: 5, episodios: 24, ano: 1998 },
        { numero: 6, episodios: 25, ano: 1999 },
        { numero: 7, episodios: 24, ano: 2000 },
        { numero: 8, episodios: 24, ano: 2001 },
        { numero: 9, episodios: 24, ano: 2002 },
        { numero: 10, episodios: 18, ano: 2003 }
    ]
};

function assistirEpisodio(imdbId, temporada, episodio) {
    const url = `https://playerflixapi.com/serie/${imdbId}/t${temporada}e${episodio}`;
    window.open(url, '_blank');
}

function renderSeriesDetail() {
    const seriesDetail = document.getElementById('seriesDetail');
    
    if (!seriesDetail) {
        console.error('Elemento seriesDetail não encontrado');
        return;
    }
    
    const selectedSeriesJSON = localStorage.getItem('selectedSeries');
    console.log('Dados do localStorage:', selectedSeriesJSON);
    
    if (!selectedSeriesJSON) {
        seriesDetail.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: white;">
                <p>Série não encontrada.</p>
                <a href="index.html" style="color: #ff6b35; text-decoration: none;">← Voltar para início</a>
            </div>
        `;
        return;
    }
    
    let serie;
    try {
        serie = JSON.parse(selectedSeriesJSON);
        console.log('Série carregada:', serie);
    } catch (e) {
        console.error('Erro ao fazer parse do JSON:', e);
        seriesDetail.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: white;">
                <p>Erro ao carregar série.</p>
                <a href="index.html" style="color: #ff6b35; text-decoration: none;">← Voltar para início</a>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="series-detail-header">
            <div class="series-detail-poster">
                <img src="${serie.poster}" alt="${serie.title}" class="series-poster-img" onerror="this.src='https://via.placeholder.com/300x450/2f2f2f/ffffff?text=Poster+Não+Disponível'">
            </div>
            <div class="series-detail-info">
                <h1 class="series-detail-title">${serie.title}</h1>
                <p class="series-detail-year">${serie.year}</p>
                <p class="series-detail-rating">⭐ ${serie.rating}/10</p>
                <p class="series-detail-genres"><strong>Gêneros:</strong> ${serie.genres || 'N/A'}</p>
                <p class="series-detail-description">${serie.description || 'Sinopse não disponível'}</p>
                
                <div class="series-detail-links">
                    <a href="https://playerflixapi.com/serie/${serie.imdbId}" target="_blank" class="link-btn watch-btn">Watch</a>
                    <a href="https://www.imdb.com/title/${serie.imdbId}" target="_blank" class="link-btn imdb-btn">Ver no IMDb</a>
                    <a href="https://www.imdb.com/title/${serie.imdbId}" target="_blank" class="link-btn tmdb-btn">Ver no TMDB</a>
                </div>
            </div>
        </div>
    `;
    
    if (serie.temporadas && serie.temporadas.length > 0) {
        html += `<div class="series-seasons-container">
            <h2>Temporadas (${serie.temporadas.length})</h2>
            <div class="series-seasons-list">`;
        
        serie.temporadas.forEach(temporada => {
            html += `
                <div class="season-card">
                    <div class="season-header">
                        <h3 class="season-title">Temporada ${temporada.numero}</h3>
                        <span class="season-episodes">${temporada.episodios} episódios</span>
                        <span class="season-year">${temporada.ano}</span>
                    </div>
                    <div class="season-episodes-grid">`;
            
            for (let i = 1; i <= temporada.episodios; i++) {
                html += `
                    <div class="episode-card">
                        <span class="episode-number">E${i}</span>
                        <span class="episode-title">Episódio ${i}</span>
                        <button class="watch-episode-btn" onclick="assistirEpisodio('${serie.imdbId}', ${temporada.numero}, ${i})">Assistir</button>
                    </div>`;
            }
            
            html += `</div></div>`;
        });
        
        html += `</div></div>`;
    } else {
        html += `<div class="series-seasons-container">
            <p style="color: white;">Nenhuma temporada disponível.</p>
        </div>`;
    }
    
    seriesDetail.innerHTML = html;
    console.log('Página renderizada com sucesso');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderSeriesDetail);
} else {
    renderSeriesDetail();
}