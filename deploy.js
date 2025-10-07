#!/usr/bin/env node

/**
 * Script de deploy para Vercel
 * Automatiza o processo de deploy da aplicação
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando processo de deploy...\n');

// Verificar se o Vercel CLI está instalado
try {
    execSync('vercel --version', { stdio: 'ignore' });
    console.log('✅ Vercel CLI encontrado');
} catch (error) {
    console.log('❌ Vercel CLI não encontrado. Instalando...');
    try {
        execSync('npm install -g vercel', { stdio: 'inherit' });
        console.log('✅ Vercel CLI instalado com sucesso');
    } catch (installError) {
        console.error('❌ Erro ao instalar Vercel CLI:', installError.message);
        process.exit(1);
    }
}

// Verificar se existe arquivo de configuração
if (!fs.existsSync('vercel.json')) {
    console.error('❌ Arquivo vercel.json não encontrado!');
    process.exit(1);
}

console.log('✅ Arquivo vercel.json encontrado');

// Verificar se as dependências estão instaladas
if (!fs.existsSync('node_modules')) {
    console.log('📦 Instalando dependências...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependências instaladas');
    } catch (error) {
        console.error('❌ Erro ao instalar dependências:', error.message);
        process.exit(1);
    }
}

// Fazer deploy
console.log('\n🚀 Fazendo deploy para Vercel...');
try {
    execSync('vercel --prod', { stdio: 'inherit' });
    console.log('\n✅ Deploy realizado com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Configure as variáveis de ambiente no dashboard do Vercel');
    console.log('2. Teste as rotas da API');
    console.log('3. Configure seu banco MongoDB');
    console.log('\n📖 Consulte o README-VERCEL.md para mais detalhes');
} catch (error) {
    console.error('❌ Erro durante o deploy:', error.message);
    process.exit(1);
}