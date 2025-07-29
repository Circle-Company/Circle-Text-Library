// Este arquivo é carregado antes da execução dos testes
// Adicionamos configurações especiais para o ambiente de teste aqui

// Resolvendo problemas com imports de CommonJS
process.env.NODE_ENV = "test"

// Mock global para evitar problemas com banco de dados real
global.mockSequelize = {
    query: async () => [[]],
    literal: (str) => str,
    models: {
        MomentStatistic: {},
    },
    random: () => ({}),
}

// Adicionando utilitários globais para testes
global.waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Suprimindo logs durante os testes
if (process.env.VITEST_SILENT) {
    console.log = () => {}
    console.error = () => {}
    console.warn = () => {}
    console.info = () => {}
}
