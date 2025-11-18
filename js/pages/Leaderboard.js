import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
        query: '',
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        La tabla de clasificación puede ser incorrecta, ya que los siguientes niveles no se pudieron cargar: {{ err.join(', ') }}
                    </p>
                </div>
                <div class="board-container">
                    <div class="list-search">
                        <div class="search-field btn-like">
                            <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM10 14a4 4 0 110-8 4 4 0 010 8z"/>
                            </svg>
                            <input type="search" v-model="query" placeholder="Buscar usuario" aria-label="Buscar usuarios">
                            <button v-if="query" class="search-clear" @click="query = ''" aria-label="Borrar búsqueda">×</button>
                        </div>
                    </div>
                    <table class="board" v-if="filteredLeaderboard.length">
                        <tr v-for="(item, i) in filteredLeaderboard" :key="item.idx">
                            <td class="rank">
                                <p class="type-label-lg">#{{ item.idx + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(item.entry.total) }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == item.idx }">
                                <button @click="selected = item.idx">
                                    <span class="type-label-lg">{{ item.entry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                    <p v-else class="type-label-md">No se encontraron resultados.</p>
                </div>
                <div class="player-container">
                    <div class="player">
                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ entry.total }}</h3>
                        <h2 v-if="entry.verified.length > 0">Verificados ({{ entry.verified.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.verified">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.completed.length > 0">Completados ({{ entry.completed.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.completed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.progressed.length > 0">Progresados ({{entry.progressed.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.progressed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
        filteredLeaderboard() {
            const q = (this.query || '').trim().toLowerCase();
            if (!q) return this.leaderboard.map((e, i) => ({ entry: e, idx: i }));
            return this.leaderboard
                .map((e, i) => ({ entry: e, idx: i }))
                .filter(({ entry }) => {
                    if (!entry) return false;
                    if (entry.user && entry.user.toLowerCase().includes(q)) return true;
                    if (entry.total && entry.total.toString().toLowerCase().includes(q)) return true;
                    return false;
                });
        },
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;
        // Hide loading spinner
        this.loading = false;
    },
    watch: {
        query() {
            const ids = this.filteredLeaderboard.map(p => p.idx);
            if (ids.length > 0 && !ids.includes(this.selected)) {
                this.selected = ids[0];
            }
        }
    },
    methods: {
        localize,
    },
};
