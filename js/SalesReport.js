document.addEventListener('sharedContentLoaded', () => {
    const salesData = [
        { date: '2023-10-01', productId: '1', quantity: 5, total: 999.50 },
        { date: '2023-10-02', productId: '5', quantity: 3, total: 389.70 },
        { date: '2023-10-05', productId: '2', quantity: 10, total: 899.00 },
        { date: '2023-10-15', productId: '1', quantity: 2, total: 399.80 },
        { date: '2023-11-10', productId: '6', quantity: 1, total: 899.90 },
        { date: '2023-11-12', productId: '3', quantity: 4, total: 719.60 },
    ];

    const salesReportForm = document.getElementById('salesReportForm');
    const categoryCheckboxesContainer = document.getElementById('categoryCheckboxes');
    const reportResult = document.getElementById('reportResult');
    const salesChartCanvas = document.getElementById('salesChart');
    let salesChart = null;

    const categories = [...new Set(produtos.map(p => p.categoria))];
    categories.forEach(category => {
        const div = document.createElement('div');
        div.classList.add('form-check');
        div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${category}" id="cat-${category}">
            <label class="form-check-label" for="cat-${category}">
                ${category}
            </label>
        `;
        categoryCheckboxesContainer.appendChild(div);
    });

    salesReportForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const selectedCategories = Array.from(document.querySelectorAll('#categoryCheckboxes input:checked')).map(cb => cb.value);

        if (!startDate || !endDate || selectedCategories.length === 0) {
            alert('Por favor, preencha o período e selecione ao menos uma categoria.');
            return;
        }

        const filteredSales = salesData.filter(sale => {
            const saleDate = new Date(sale.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            const product = produtos.find(p => p.id === sale.productId);
            return saleDate >= start && saleDate <= end && product && selectedCategories.includes(product.categoria);
        });

        const reportData = processReportData(filteredSales, selectedCategories);
        renderChart(reportData);
        reportResult.classList.remove('d-none');
    });

    function processReportData(filteredSales, selectedCategories) {
        const data = {
            labels: selectedCategories,
            datasets: [{
                label: 'Total de Vendas (R$)',
                data: [],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };

        selectedCategories.forEach(category => {
            const categorySales = filteredSales.filter(sale => {
                const product = produtos.find(p => p.id === sale.productId);
                return product && product.categoria === category;
            });
            const total = categorySales.reduce((sum, sale) => sum + sale.total, 0);
            data.datasets[0].data.push(total);
        });

        return data;
    }

    function renderChart(data) {
        if (salesChart) {
            salesChart.destroy();
        }
        salesChart = new Chart(salesChartCanvas, {
            type: 'line',
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});