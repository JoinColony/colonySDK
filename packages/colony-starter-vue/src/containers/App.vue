<template>
    <App :colony-client="colonyClient" :error="error" :loading="loading" />
</template>

<script>
    import App from '../components/App.vue';
    import { getNetworkClient } from '@colony/colony-js-client';
    import { open } from '@colony/purser-metamask';

    export default {
        name: 'app',
        components: {
            App
        },
        data() {
            return {
                colonyClient: null,
                error: null,
                loading: true,
            }
        },
        mounted() {
            open()
                .then(wallet => getNetworkClient('local', wallet))
                .then(networkClient => networkClient.getColonyClient(1))
                .then(colonyClient => {
                    this.loading = false;
                    this.colonyClient = colonyClient;
                })
                .catch(error => {
                    this.loading = false;
                    this.error = error;
                })
        }
    }
</script>

<style>
    body {
        margin: 0;
    }
</style>