/**
 * PokédexWeb - Lógica de interacción y consumo de PokeAPI
 */

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const randomButton = document.getElementById('randomButton');
const pokemonContainer = document.getElementById('pokemonContainer');
const quickButtons = document.querySelectorAll('.quick-btn');

// Configuración de tipos (traducción, colores de Tailwind y degradados)
const typeDetails = {
    normal: { name: 'Normal', badge: 'bg-stone-400 text-white', gradient: 'from-stone-100 to-stone-200' },
    fire: { name: 'Fuego', badge: 'bg-red-500 text-white', gradient: 'from-orange-100 to-red-200' },
    water: { name: 'Agua', badge: 'bg-blue-500 text-white', gradient: 'from-blue-100 to-cyan-200' },
    grass: { name: 'Planta', badge: 'bg-emerald-500 text-white', gradient: 'from-green-100 to-emerald-200' },
    electric: { name: 'Eléctrico', badge: 'bg-yellow-400 text-yellow-950', gradient: 'from-yellow-100 to-amber-200' },
    ice: { name: 'Hielo', badge: 'bg-cyan-400 text-cyan-950', gradient: 'from-cyan-100 to-sky-200' },
    fighting: { name: 'Lucha', badge: 'bg-red-700 text-white', gradient: 'from-red-100 to-amber-200' },
    poison: { name: 'Veneno', badge: 'bg-purple-600 text-white', gradient: 'from-purple-100 to-fuchsia-200' },
    ground: { name: 'Tierra', badge: 'bg-amber-600 text-white', gradient: 'from-amber-100 to-yellow-200' },
    flying: { name: 'Volador', badge: 'bg-indigo-300 text-indigo-950', gradient: 'from-indigo-100 to-sky-200' },
    psychic: { name: 'Psíquico', badge: 'bg-pink-500 text-white', gradient: 'from-pink-100 to-rose-200' },
    bug: { name: 'Bicho', badge: 'bg-lime-600 text-white', gradient: 'from-lime-100 to-emerald-200' },
    rock: { name: 'Roca', badge: 'bg-stone-500 text-white', gradient: 'from-stone-200 to-stone-300' },
    ghost: { name: 'Fantasma', badge: 'bg-purple-900 text-white', gradient: 'from-purple-100 to-indigo-200' },
    dragon: { name: 'Dragón', badge: 'bg-indigo-700 text-white', gradient: 'from-indigo-100 to-purple-200' },
    steel: { name: 'Acero', badge: 'bg-slate-400 text-white', gradient: 'from-slate-100 to-zinc-300' },
    fairy: { name: 'Hada', badge: 'bg-pink-300 text-pink-950', gradient: 'from-pink-100 to-rose-200' },
    dark: { name: 'Siniestro', badge: 'bg-zinc-800 text-white', gradient: 'from-zinc-200 to-stone-400' }
};

// Configuración de estadísticas base
const statDetails = {
    'hp': { name: 'Puntos de Salud (PS)', max: 255, color: 'bg-emerald-500' },
    'attack': { name: 'Ataque', max: 190, color: 'bg-red-500' },
    'defense': { name: 'Defensa', max: 230, color: 'bg-blue-500' },
    'special-attack': { name: 'Ataque Especial', max: 194, color: 'bg-purple-500' },
    'special-defense': { name: 'Defensa Especial', max: 230, color: 'bg-indigo-500' },
    'speed': { name: 'Velocidad', max: 180, color: 'bg-amber-500' }
};

// Estado actual
let currentPokemonData = null;
let isShowingShiny = false;

// Capitalizar primera letra de un texto
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Formatear ID con ceros a la izquierda (ej: #0025)
function formatId(id) {
    return `#${String(id).padStart(4, '0')}`;
}

// Mostrar estado de carga
function showLoading(query) {
    pokemonContainer.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto border border-gray-100 animate-pulse">
            <div class="relative w-20 h-20 mx-auto mb-4 animate-spin">
                <!-- Pokébola animada -->
                <div class="w-20 h-20 bg-white rounded-full border-4 border-gray-800 relative overflow-hidden flex items-center justify-center">
                    <div class="absolute top-0 left-0 right-0 h-1/2 bg-red-600"></div>
                    <div class="absolute w-full h-2 bg-gray-800 top-1/2 -translate-y-1/2"></div>
                    <div class="w-6 h-6 bg-white rounded-full border-4 border-gray-800 z-10"></div>
                </div>
            </div>
            <p class="text-xl font-bold text-gray-800">Consultando Pokédex...</p>
            <p class="text-sm text-gray-500 mt-1">Buscando "${query}" en la base de datos de PokeAPI</p>
        </div>
    `;
}

// Mostrar mensaje de error
function showError(message, query) {
    pokemonContainer.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto border border-red-200">
            <div class="w-12 h-12 mx-auto mb-3 text-red-500 flex items-center justify-center bg-red-50 rounded-full">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
            </div>
            <h3 class="text-2xl font-bold text-red-600 mb-2">Pokémon no encontrado</h3>
            <p class="text-gray-600 mb-6">
                No pudimos encontrar ningún Pokémon con el término 
                <span class="font-bold text-gray-800">"${query}"</span>.
                ${message}
            </p>
            <div class="bg-gray-100 rounded-lg p-3 text-xs text-gray-600 mb-4">
                Consejo: Puedes buscar por nombre en inglés (ej: <strong>pikachu</strong>, <strong>eevee</strong>) o por número (ej: <strong>1</strong> al <strong>1025</strong>).
            </div>
            <button 
                onclick="fetchPokemon('pikachu')" 
                class="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold px-5 py-2.5 rounded-lg transition shadow">
                Ver a Pikachu
            </button>
        </div>
    `;
}

// Renderizar la ficha del Pokémon
function renderPokemon(pokemon) {
    currentPokemonData = pokemon;
    isShowingShiny = false;

    // Tipo principal y secundario
    const primaryType = pokemon.types[0]?.type?.name || 'normal';
    const typeInfo = typeDetails[primaryType] || { name: capitalize(primaryType), badge: 'bg-gray-500 text-white', gradient: 'from-gray-100 to-gray-200' };

    // Sprites
    const regularImage = pokemon.sprites?.other?.['official-artwork']?.front_default
        || pokemon.sprites?.other?.home?.front_default
        || pokemon.sprites?.front_default
        || '';

    const shinyImage = pokemon.sprites?.other?.['official-artwork']?.front_shiny
        || pokemon.sprites?.other?.home?.front_shiny
        || pokemon.sprites?.front_shiny
        || regularImage;

    // Altura (en decímetros a metros) y peso (en hectogramos a kg)
    const heightMeters = (pokemon.height / 10).toFixed(1);
    const weightKg = (pokemon.weight / 10).toFixed(1);

    // Tipos renderizados
    const typesHtml = pokemon.types.map(t => {
        const typeKey = t.type.name;
        const details = typeDetails[typeKey] || { name: capitalize(typeKey), badge: 'bg-gray-500 text-white' };
        return `
            <span class="${details.badge} px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider">
                ${details.name}
            </span>
        `;
    }).join('');

    // Habilidades
    const abilitiesHtml = pokemon.abilities.map(a => {
        const abilityName = capitalize(a.ability.name.replace(/-/g, ' '));
        const isHidden = a.is_hidden ? '<span class="text-[10px] text-purple-700 font-semibold ml-1 bg-purple-100 px-1.5 py-0.5 rounded">Oculta</span>' : '';
        return `
            <span class="bg-gray-100 border border-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-md flex items-center">
                ${abilityName} ${isHidden}
            </span>
        `;
    }).join('');

    // Estadísticas
    let totalStats = 0;
    const statsHtml = pokemon.stats.map(s => {
        const statKey = s.stat.name;
        const statValue = s.base_stat;
        totalStats += statValue;
        const config = statDetails[statKey] || { name: capitalize(statKey), max: 200, color: 'bg-gray-500' };
        const percentage = Math.min(100, Math.round((statValue / config.max) * 100));

        return `
            <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                    <span class="text-gray-600">${config.name}</span>
                    <span class="text-gray-900">${statValue}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                        class="${config.color} h-2.5 rounded-full transition-all duration-700 ease-out" 
                        style="width: ${percentage}%">
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Grito del Pokémon (audio disponible en PokeAPI)
    const cryUrl = pokemon.cries?.latest || pokemon.cries?.legacy || null;

    pokemonContainer.innerHTML = `
        <article class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300">
            <!-- Encabezado con degradado del tipo principal -->
            <div class="bg-gradient-to-br ${typeInfo.gradient} p-6 relative">
                <!-- Barra superior con ID, Audio y Navegación rápida -->
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-black tracking-widest text-gray-700 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                        ${formatId(pokemon.id)}
                    </span>

                    <div class="flex items-center gap-2">
                        ${cryUrl ? `
                            <button 
                                onclick="playPokemonCry('${cryUrl}')" 
                                title="Escuchar sonido del Pokémon"
                                class="bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-sm hover:scale-105 transition cursor-pointer flex items-center justify-center"
                                aria-label="Reproducir sonido de ${pokemon.name}">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                                </svg>
                            </button>
                        ` : ''}
                        ${shinyImage !== regularImage ? `
                            <button 
                                id="shinyToggleBtn"
                                onclick="toggleShinySprite('${regularImage}', '${shinyImage}')" 
                                title="Alternar versión Variocolor (Shiny)"
                                class="bg-white/80 hover:bg-white text-xs font-bold text-gray-700 px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition flex items-center gap-1 cursor-pointer">
                                <span id="shinyBtnText">Shiny</span>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Nombre del Pokémon -->
                <h2 class="text-3xl font-extrabold text-gray-900 capitalize tracking-tight mb-2">
                    ${pokemon.name}
                </h2>

                <!-- Badges de tipos -->
                <div class="flex flex-wrap gap-2 mb-4">
                    ${typesHtml}
                </div>

                <!-- Imagen del Pokémon con sombra -->
                <div class="relative flex justify-center items-center py-4">
                    <!-- Patrón de fondo Pokébola grande sutil -->
                    <div class="absolute w-48 h-48 rounded-full bg-white/40 blur-xl"></div>
                    <img 
                        id="pokemonSprite"
                        src="${regularImage}" 
                        alt="${pokemon.name}" 
                        class="w-56 h-56 object-contain z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                        loading="lazy">
                </div>
            </div>

            <!-- Cuerpo con Datos y Estadísticas -->
            <div class="p-6 space-y-6">
                <!-- Atributos Físicos (Peso, Altura, Experiencia) -->
                <div class="grid grid-cols-3 gap-3 bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                    <div>
                        <span class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Altura</span>
                        <span class="text-base font-bold text-gray-800">${heightMeters} m</span>
                    </div>
                    <div>
                        <span class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Peso</span>
                        <span class="text-base font-bold text-gray-800">${weightKg} kg</span>
                    </div>
                    <div>
                        <span class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Exp. Base</span>
                        <span class="text-base font-bold text-gray-800">${pokemon.base_experience || 'N/A'}</span>
                    </div>
                </div>

                <!-- Habilidades -->
                <div>
                    <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                        Habilidades
                    </h3>
                    <div class="flex flex-wrap gap-2">
                        ${abilitiesHtml}
                    </div>
                </div>

                <!-- Estadísticas Base -->
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wide">
                            Estadísticas Base
                        </h3>
                        <span class="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            Total: ${totalStats}
                        </span>
                    </div>
                    <div class="space-y-2.5">
                        ${statsHtml}
                    </div>
                </div>

                <!-- Botones de Navegación Anterior / Siguiente -->
                <div class="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <button 
                        onclick="fetchPokemon(${pokemon.id - 1})" 
                        ${pokemon.id <= 1 ? 'disabled class="opacity-40 cursor-not-allowed bg-gray-200 text-gray-400 px-4 py-2 rounded-xl text-sm font-bold"' : 'class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-1 cursor-pointer"'}
                    >
                        &larr; Anterior
                    </button>

                    <button 
                        onclick="fetchPokemon(${pokemon.id + 1})" 
                        ${pokemon.id >= 1025 ? 'disabled class="opacity-40 cursor-not-allowed bg-gray-200 text-gray-400 px-4 py-2 rounded-xl text-sm font-bold"' : 'class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-1 cursor-pointer"'}
                    >
                        Siguiente &rarr;
                    </button>
                </div>
            </div>
        </article>
    `;
}

// Reproducir el sonido/rugido del Pokémon
window.playPokemonCry = function (audioUrl) {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.volume = 0.5;
    audio.play().catch(err => {
        console.warn('No se pudo reproducir el sonido:', err);
    });
};

// Alternar entre imagen regular y versión Shiny (variocolor)
window.toggleShinySprite = function (regularImg, shinyImg) {
    const spriteImg = document.getElementById('pokemonSprite');
    const shinyBtnText = document.getElementById('shinyBtnText');
    if (!spriteImg) return;

    if (!isShowingShiny) {
        spriteImg.src = shinyImg;
        if (shinyBtnText) shinyBtnText.textContent = 'Normal';
        isShowingShiny = true;
    } else {
        spriteImg.src = regularImg;
        if (shinyBtnText) shinyBtnText.textContent = 'Shiny';
        isShowingShiny = false;
    }
};

// Función principal para obtener datos de PokeAPI
async function fetchPokemon(query) {
    if (!query) {
        alert('Por favor ingresa un nombre o número de Pokémon.');
        searchInput.focus();
        return;
    }

    const cleanQuery = String(query).trim().toLowerCase();
    showLoading(cleanQuery);

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanQuery}`);

        if (!response.ok) {
            throw new Error(response.status === 404 ? 'No existe' : 'Error en la conexión con la API');
        }

        const data = await response.json();
        renderPokemon(data);

        // Actualizar el valor del input al nombre del Pokémon actual
        searchInput.value = '';
    } catch (error) {
        console.error('Error al consultar Pokémon:', error);
        showError('Verifica la ortografía o intenta con otro número.', cleanQuery);
    }
}

// Event Listeners
searchButton.addEventListener('click', () => {
    fetchPokemon(searchInput.value);
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        fetchPokemon(searchInput.value);
    }
});

// Botón de Pokémon Aleatorio (Generaciones 1 a 9, IDs 1 a 1025)
if (randomButton) {
    randomButton.addEventListener('click', () => {
        const randomId = Math.floor(Math.random() * 1025) + 1;
        fetchPokemon(randomId);
    });
}

// Botones rápidos (sugerencias)
quickButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const pokemonName = btn.getAttribute('data-name');
        if (pokemonName) {
            fetchPokemon(pokemonName);
        }
    });
});

// Cargar un Pokémon inicial por defecto al abrir la página (Pikachu, ID 25)
document.addEventListener('DOMContentLoaded', () => {
    fetchPokemon(25);
});
