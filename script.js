function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        const newAlertContainer = document.createElement('div');
        newAlertContainer.id = 'alertContainer';
        document.body.appendChild(newAlertContainer);
        Object.assign(newAlertContainer.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '1050',
            maxWidth: '300px'
        });
    }

    const finalAlertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show');
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    finalAlertContainer.appendChild(alertDiv);
    setTimeout(() => {
        const bsAlert = bootstrap.Alert.getInstance(alertDiv);
        if (bsAlert) {
            bsAlert.close();
        } else if (alertDiv) {
            alertDiv.remove();
        }
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    const salvarClienteBtn = document.getElementById('salvarCliente');
    const cancelarClienteBtn = document.getElementById('cancelarCliente');

    if (salvarClienteBtn) {
        salvarClienteBtn.addEventListener('click', () => {
            showAlert('Cliente salvo com sucesso', 'success');
        });
    }

    if (cancelarClienteBtn) {
        cancelarClienteBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    const salvarAlteracoesBtn = document.getElementById('salvarAlteracoesBtn');
    if (salvarAlteracoesBtn) {
        salvarAlteracoesBtn.addEventListener('click', () => {
            showAlert('Cliente editado com sucesso', 'success');
            setTimeout(() => {
                const editarDadosModalEl = document.getElementById('editarDadosModal');
                if (editarDadosModalEl) {
                    const editarDadosModal = bootstrap.Modal.getInstance(editarDadosModalEl);
                    if (editarDadosModal) {
                        editarDadosModal.hide();
                    }
                }
            }, 100);
        });
    }

    const inativarBtn = document.getElementById('inativarBtn');
    if (inativarBtn) {
        inativarBtn.addEventListener('click', () => {
            showAlert('Cliente inativado com sucesso', 'success');
        });
    }

    const salvarEnderecoBtn = document.getElementById('salvarEnderecoBtn');
    if (salvarEnderecoBtn) {
        salvarEnderecoBtn.addEventListener('click', () => {
            showAlert('Endereço salvo com sucesso', 'success');
             setTimeout(() => {
                const addEnderecoModalEl = document.getElementById('addEnderecoModal');
                 if (addEnderecoModalEl) {
                    const addEnderecoModal = bootstrap.Modal.getInstance(addEnderecoModalEl);
                    if (addEnderecoModal) {
                        addEnderecoModal.hide();
                    }
                }
            }, 100);
        });
    }


    const salvarSenhaBtn = document.getElementById('salvarSenhaBtn');
    if (salvarSenhaBtn) {
        salvarSenhaBtn.addEventListener('click', () => {
            showAlert('Senha alterada com sucesso', 'success');
             setTimeout(() => {
                const editarSenhaModalEl = document.getElementById('editarSenhaModal');
                 if (editarSenhaModalEl) {
                    const editarSenhaModal = bootstrap.Modal.getInstance(editarSenhaModalEl);
                    if (editarSenhaModal) {
                        editarSenhaModal.hide();
                    }
                }
            }, 100);
        });
    }


    const salvarEdicaoEnderecoBtn = document.getElementById('salvarEdicaoEnderecoBtn');
    if (salvarEdicaoEnderecoBtn) {
        salvarEdicaoEnderecoBtn.addEventListener('click', () => {
            showAlert('Endereço editado com sucesso', 'success');
            

            setTimeout(() => {
                const editarEnderecoModalEl = document.getElementById('addEnderecoModal'); 
                if (editarEnderecoModalEl) {
                    const editarEnderecoModal = bootstrap.Modal.getInstance(editarEnderecoModalEl);
                    if (editarEnderecoModal) {
                        editarEnderecoModal.hide();
                    }
                }
            }, 100);
        });
    }


    const salvarCartaoBtn = document.getElementById('salvarCartaoBtn');
    if (salvarCartaoBtn) {
        salvarCartaoBtn.addEventListener('click', () => {
            showAlert('Cartão salvo com sucesso', 'success');

            setTimeout(() => {
                const addCartaoModalEl = document.getElementById('addCartaoModal');
                if (addCartaoModalEl) {
                    const addCartaoModal = bootstrap.Modal.getInstance(addCartaoModalEl);
                    if (addCartaoModal) {
                        addCartaoModal.hide();
                    }
                }
            }, 100);
        });
    }
});