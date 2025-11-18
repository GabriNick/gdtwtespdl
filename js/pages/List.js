import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <div class="list-search">
                    <div class="search-field btn-like">
                        <!-- inline search icon -->
                        <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM10 14a4 4 0 110-8 4 4 0 010 8z"/>
                        </svg>
                        <input type="search" v-model="query" placeholder="Buscar nivel, autor o ID" aria-label="Buscar niveles">
                        <button v-if="query" class="search-clear" @click="query = ''" aria-label="Borrar búsqueda">×</button>
                    </div>
                    <!-- result count removed per user request -->
                </div>
                <table class="list" v-if="filteredList.length">
                    <tr v-for="(item, i) in filteredList" :key="item.idx">
                        <td class="rank">
                            <p v-if="item.idx + 1 <= 150" class="type-label-lg">#{{ item.idx + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == item.idx, 'error': !item.entry[0] }">
                            <button @click="selected = item.idx">
                                <span class="type-label-lg">{{ item.entry[0]?.name || ('Error (' + item.entry[1] + '.json)') }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
                <p v-else class="type-label-md">No se encontraron resultados.</p>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :firstSubmitter="level.firstSubmitter"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Puntos al completar</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Contraseña</div>
                            <p>{{ level.password || 'Libre para copiar' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 75"><strong>{{ level.percentToQualify }}%</strong> para calificar</p>
                    <p v-else-if="selected +1 <= 150"><strong>100%</strong> para calificar</p>
                    <p v-else>Este nivel no acepta nuevos records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="fps">
                                <p>{{ record.fps }}FPS</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Sigue a la comunidad de <a href="https://x.com/i/communities/1704308200755884113" target="_blank">GDTWT En Español</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>Editores de la Lista</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Requisitos de Envío</h3>
                    <p>
                        Tener cuenta de Twitter con mínimo 100 seguidores y estar en la comunidad de <a href="https://x.com/i/communities/1704308200755884113" target="_blank">GDTWT En Español</a>
                    </p>
                    <p>
                        Logra el record sin usar hacks (sin embargo, el FPS bypass está permitido, hasta 360fps)
                    </p>
                    <p>
                        Logra el record en el nivel que aparece en el sitio - por favor revisa el ID del nivel antes de enviar un record
                    </p>
                    <p>
                        El video debe tener audio original o clics/toques. El audio editado solamente no cuenta
                    </p>
                    <p>
                        La grabación debe mostrar un intento previo y toda la animación de muerte antes de la finalización, a menos que la finalización sea en el primer intento. Los records de Everyplay están exentos de esto
                    </p>
                    <p>
                        La grabación también debe mostrar al jugador tocando la pared final, de lo contrario la finalización será invalidada.
                    </p>
                    <p>
                        No uses rutas secretas o rutas de bugs
                    </p>
                    <p>
                        No uses modos fáciles, solo cuenta el record en el nivel sin modificar
                    </p>
                    <p>
                        Una vez que un nivel pasa a la Lista Legacy, aceptamos records por 24 horas después de que sale, luego de eso nunca más aceptamos records para ese nivel
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        // full list as fetched from the server. We keep this separate so
        // we can filter it without changing indices used elsewhere.
        fullList: [],
        editors: [],
        loading: true,
        // selected stores the index into fullList
        selected: 0,
        errors: [],
        // search query
        query: '',
        roleIconMap,
        store
    }),
    computed: {
        level() {
            const entry = this.fullList[this.selected];
            return entry ? entry[0] : null;
        },
        // returns array of { entry: [level, err], idx: originalIndex }
        filteredList() {
            const q = (this.query || '').trim().toLowerCase();
            if (!this.fullList || this.fullList.length === 0) return [];
            const mapped = this.fullList.map((e, i) => ({ entry: e, idx: i }));
            if (!q) return mapped;

            return mapped.filter(({ entry: [level, err] }) => {
                if (!level) return (err && err.toString().toLowerCase().includes(q));
                if (level.name && level.name.toLowerCase().includes(q)) return true;
                if (level.id && level.id.toString().toLowerCase().includes(q)) return true;
                if (level.author && level.author.toLowerCase().includes(q)) return true;
                if (Array.isArray(level.creators) && level.creators.join(' ').toLowerCase().includes(q)) return true;
                if (level.firstSubmitter && level.firstSubmitter.toLowerCase().includes(q)) return true;
                return false;
            });
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.fullList = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.fullList) {
            this.errors = [
                "No se pudo cargar la lista. Intenta de nuevo en unos minutos o notifica al staff de la lista.",
            ];
        } else {
            this.errors.push(
                ...this.fullList
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `No se pudo cargar el nivel. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("No se pudo cargar los editores de la lista.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
    watch: {
        // when the query changes, if the currently selected index is filtered out,
        // move selection to the first visible result so the details pane stays in sync
        query() {
            const ids = this.filteredList.map(p => p.idx);
            if (ids.length > 0 && !ids.includes(this.selected)) {
                this.selected = ids[0];
            }
        }
    },
};
