
document.addEventListener('DOMContentLoaded', () => {
    const modalsToLoad = [
        'modals/pagAdm/_enderecosModal.html',
        'modals/pagAdm/_cartoesModal.html',
        'modals/pagAdm/_editarDadosModal.html',
        'modals/pagAdm/_addEnderecoModal.html',
        'modals/pagAdm/_editarSenhaModal.html',
        'modals/pagAdm/_addCartaoModal.html',
        'modals/pagAdm/_transacoesModal.html',
        'modals/pagAdm/_gerenciarPedidosModal.html',
        'modals/pagAdm/_confirmarTrocaModal.html',
        'modals/pagAdm/_confirmarChegadaItensModal.html'
    ];

    modalsToLoad.forEach(modalPath => {
        fetch(modalPath)
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const modalDoc = parser.parseFromString(data, 'text/html');
                const modalContent = modalDoc.body.firstChild;

                if (modalContent) {
                    document.body.appendChild(modalContent);
                }
            })
            .catch(error => console.error(`Erro ao carregar ${modalPath}:`, error));
    });
});
