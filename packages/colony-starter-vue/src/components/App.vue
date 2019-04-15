<template>
    <div class="container">
        <header class="header">
            <img :src="logo" class="logo" alt="logo">
            <h1 class="title">
                {{'colony-starter-vue'}}
            </h1>
        </header>
        <div class="message">
            <p v-if="error">{{ error }}</p>
            <p v-if="loading">{{'loading...'}}</p>
            <div v-if="colonyClient">
                <p>{{`Wallet Address: ${colonyClient.adapter.wallet.address}`}}</p>
                <p>{{`Network Address: ${colonyClient.networkClient.contract.address}`}}</p>
                <p>{{`Colony Address: ${colonyClient.contract.address}`}}</p>
            </div>
        </div>
    </div>
</template>

<script>
    import logo from '../assets/logo.png';
    
    const App = {
        props: {
            colonyClient: {
                type: Object,
                default: null
            },
            error: {
                type: Object,
                default: null
            },
            loading: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                logo: logo
            }
        }

    };

    export default App;
</script>

<style scoped>
    .container {
        font-family: sans-serif;
        text-align: center;
        width: 100vw;
    }

    .header {
        background-color: rgb(40,44,52);
        height: 12vmin;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }

    .logo {
        /*animation: App-logo-spin infinite 20s linear;*/
        height: 6vmin;
    }

    .title {
        color: rgb(97,218,251);
        font-size: calc(5px + 2vmin);
        font-weight: 300;
    }

    @keyframes App-logo-spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .message {
        padding: 4vmin;
    }
</style>