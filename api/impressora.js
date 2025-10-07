import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Comandos ESC/POS para impressora POS58
const ESC_POS = {
    INIT: '\x1B\x40',           // Inicializar impressora
    FEED_LINE: '\x0A',          // Nova linha
    CUT: '\x1D\x56\x00',        // Cortar papel
    ALIGN_CENTER: '\x1B\x61\x01', // Centralizar
    ALIGN_LEFT: '\x1B\x61\x00',   // Alinhar à esquerda
    BOLD_ON: '\x1B\x45\x01',      // Negrito ligado
    BOLD_OFF: '\x1B\x45\x00',     // Negrito desligado
    SIZE_NORMAL: '\x1D\x21\x00',  // Tamanho normal
    SIZE_DOUBLE: '\x1D\x21\x11',  // Tamanho duplo
};

function formatarRecibo(pedido) {
    let recibo = '';
    
    // Cabeçalho
    recibo += ESC_POS.INIT;
    recibo += ESC_POS.ALIGN_CENTER;
    recibo += ESC_POS.SIZE_DOUBLE;
    recibo += ESC_POS.BOLD_ON;
    recibo += 'PIZZARIA ADMIN\n';
    recibo += ESC_POS.BOLD_OFF;
    recibo += ESC_POS.SIZE_NORMAL;
    recibo += '================================\n';
    
    // Informações do pedido
    recibo += ESC_POS.ALIGN_LEFT;
    recibo += `Pedido: #${pedido.numero || pedido._id}\n`;
    recibo += `Data: ${new Date(pedido.criadoEm).toLocaleString('pt-BR')}\n`;
    recibo += `Cliente: ${pedido.cliente?.nome || 'N/A'}\n`;
    if (pedido.cliente?.telefone) {
        recibo += `Telefone: ${pedido.cliente.telefone}\n`;
    }
    recibo += '--------------------------------\n';
    
    // Itens do pedido
    recibo += ESC_POS.BOLD_ON;
    recibo += 'ITENS:\n';
    recibo += ESC_POS.BOLD_OFF;
    
    let total = 0;
    if (pedido.itens && pedido.itens.length > 0) {
        pedido.itens.forEach(item => {
            const subtotal = (item.preco || 0) * (item.quantidade || 1);
            total += subtotal;
            
            recibo += `${item.quantidade}x ${item.nome}\n`;
            if (item.tamanho) {
                recibo += `   Tamanho: ${item.tamanho}\n`;
            }
            if (item.observacoes) {
                recibo += `   Obs: ${item.observacoes}\n`;
            }
            recibo += `   R$ ${subtotal.toFixed(2)}\n`;
            recibo += '--------------------------------\n';
        });
    }
    
    // Total
    recibo += ESC_POS.BOLD_ON;
    recibo += ESC_POS.SIZE_DOUBLE;
    recibo += `TOTAL: R$ ${total.toFixed(2)}\n`;
    recibo += ESC_POS.SIZE_NORMAL;
    recibo += ESC_POS.BOLD_OFF;
    
    // Rodapé
    recibo += '================================\n';
    recibo += ESC_POS.ALIGN_CENTER;
    recibo += 'Obrigado pela preferencia!\n';
    recibo += ESC_POS.FEED_LINE;
    recibo += ESC_POS.FEED_LINE;
    recibo += ESC_POS.CUT;
    
    return recibo;
}

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await client.connect();
        const db = client.db('pizzaria');

        switch (req.method) {
            case 'POST':
                const { acao, pedidoId, dadosImpressao } = req.body;

                if (acao === 'imprimir_pedido') {
                    // Buscar o pedido no banco
                    const pedido = await db.collection('pedidos').findOne({ 
                        _id: new ObjectId(pedidoId) 
                    });

                    if (!pedido) {
                        return res.status(404).json({ error: 'Pedido não encontrado' });
                    }

                    // Gerar comandos ESC/POS
                    const comandosImpressao = formatarRecibo(pedido);

                    // Registrar tentativa de impressão
                    await db.collection('logs_impressao').insertOne({
                        pedidoId: pedido._id,
                        timestamp: new Date(),
                        status: 'enviado',
                        comandos: comandosImpressao
                    });

                    return res.status(200).json({
                        success: true,
                        message: 'Comandos de impressão gerados',
                        comandos: comandosImpressao,
                        // Para desenvolvimento, retornamos os comandos
                        // Em produção, estes seriam enviados via Bluetooth
                        debug: {
                            pedido: pedido,
                            tamanhoComandos: comandosImpressao.length
                        }
                    });
                }

                if (acao === 'testar_impressora') {
                    const comandoTeste = ESC_POS.INIT + 
                                       ESC_POS.ALIGN_CENTER + 
                                       'TESTE DE IMPRESSORA\n' +
                                       'POS58 via Bluetooth\n' +
                                       ESC_POS.FEED_LINE +
                                       ESC_POS.CUT;

                    return res.status(200).json({
                        success: true,
                        message: 'Comando de teste gerado',
                        comandos: comandoTeste
                    });
                }

                return res.status(400).json({ error: 'Ação não reconhecida' });

            case 'GET':
                // Buscar logs de impressão
                const logs = await db.collection('logs_impressao')
                    .find({})
                    .sort({ timestamp: -1 })
                    .limit(50)
                    .toArray();

                return res.status(200).json(logs);

            default:
                return res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro na API de impressão:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        await client.close();
    }
}