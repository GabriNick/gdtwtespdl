import routes from './routes.js';

export const store = Vue.reactive({
    dark: JSON.parse(localStorage.getItem('dark')),
    // Si no hay preferencia guardada, iniciar en modo oscuro
    getDarkDefault() {
        return this.dark === null ? true : this.dark;
    },
    toggleDark() {
        this.dark = !this.getDarkDefault();
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },
});

const app = Vue.createApp({
    data: () => ({ store }),
    created() {
        // Forzar modo oscuro por defecto si no hay preferencia guardada
        if (this.store.dark === null) {
            this.store.dark = true;
        }
    },
});
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

app.use(router);

app.mount('#app');
