document.addEventListener('sharedContentLoaded', () => {
    const salesReportForm = document.getElementById('salesReportForm');
    const reportResult = document.getElementById('reportResult');
    const salesChartCanvas = document.getElementById('salesChart');
    let salesChart = null;
    const chartColors = [
        'rgb(75, 192, 192)',
        'rgb(255, 99, 132)',
        'rgb(255, 205, 86)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
    ];
    const getIsoDatePart = (dateStr) => dateStr.split('T')[0];
    const formatIsoDateToPtBr = (isoDate) => {
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    };

    salesReportForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const reportType = document.getElementById('reportType').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate) {
            alert('Por favor, preencha o período.');
            return;
        }

        try {
            let data;
            let chartData;
            let chartConfig = {};

            if (reportType === 'venda') {
                data = await fetchVendasPorDia(startDate, endDate);
                chartData = processVendasPorDiaData(data);
                chartConfig = {
                    yAxisTitle: 'Valor Total (R$)',
                    secondaryAxisTitle: 'Quantidade de Transações',
                    includeSecondaryAxis: true
                };
            } else if (reportType === 'categoria') {
                data = await fetchVendasPorCategoria(startDate, endDate);
                chartData = processVendasPorCategoriaData(data);
                chartConfig = {
                    yAxisTitle: 'Valor Total (R$)',
                    includeSecondaryAxis: false
                };
            } else {
                data = await fetchVendasPorProduto(startDate, endDate);
                chartData = processVendasPorProdutoData(data);
                chartConfig = {
                    yAxisTitle: 'Quantidade Vendida',
                    includeSecondaryAxis: false
                };
            }

            renderChart(chartData, chartConfig);
            reportResult.classList.remove('d-none');
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            alert('Erro ao gerar relatório. Por favor, tente novamente.');
        }
    });

    async function fetchVendasPorDia(startDate, endDate) {
        const url = `https://localhost:7280/Transacao/GraficoPorVenda?dataInicio=${startDate}&dataFim=${endDate}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        return await response.json();
    }

    async function fetchVendasPorCategoria(startDate, endDate) {
        const url = `https://localhost:7280/Transacao/GraficoPorVendaCategoria?dataInicio=${startDate}&dataFim=${endDate}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        return await response.json();
    }

    async function fetchVendasPorProduto(startDate, endDate) {
        const url = `https://localhost:7280/Transacao/GraficoPorVendaProduto?dataInicio=${startDate}&dataFim=${endDate}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        return await response.json();
    }

    function processVendasPorDiaData(data) {
        const sortedData = [...data].sort((a, b) => {
            const dateA = getIsoDatePart(a.data);
            const dateB = getIsoDatePart(b.data);
            return dateA.localeCompare(dateB);
        });

        const labels = sortedData.map(item => {
            const isoDate = getIsoDatePart(item.data);
            return formatIsoDateToPtBr(isoDate);
        });

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Total de Vendas (R$)',
                    data: sortedData.map(item => item.valorTotal),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: 'Quantidade de Transações',
                    data: sortedData.map(item => item.quantidadeVendas),
                    fill: false,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                    yAxisID: 'y1'
                }
            ]
        };
    }

    function processVendasPorCategoriaData(data) {
        const categories = [...new Set(data.map(item => item.categoriaNome))];
        const normalizeDate = (dateStr) => getIsoDatePart(dateStr);

        const dates = [...new Set(data.map(item => normalizeDate(item.data)))].sort((a, b) => a.localeCompare(b));

        const labels = dates.map(date => formatIsoDateToPtBr(date));

        const datasets = categories.map((category, index) => {
            const categoryData = dates.map(date => {
                const item = data.find(d => {
                    const itemDate = normalizeDate(d.data);
                    return itemDate === date && d.categoriaNome === category;
                });
                return item ? item.valorTotal : 0;
            });

            return {
                label: category,
                data: categoryData,
                fill: false,
                borderColor: chartColors[index % chartColors.length],
                tension: 0.1
            };
        });

        return {
            labels: labels,
            datasets: datasets
        };
    }

    function processVendasPorProdutoData(data) {
        const normalizeDate = (dateStr) => getIsoDatePart(dateStr);

        const products = [...new Set(data.map(item => item.produtoNome))];
        const dates = [...new Set(data.map(item => normalizeDate(item.data)))].sort((a, b) => a.localeCompare(b));

        const labels = dates.map(date => formatIsoDateToPtBr(date));

        const datasets = products.map((product, index) => {
            const productData = dates.map(date => {
                const item = data.find(d => {
                    const itemDate = normalizeDate(d.data);
                    return itemDate === date && d.produtoNome === product;
                });
                return item ? item.quantidade : 0;
            });

            return {
                label: product,
                data: productData,
                fill: false,
                borderColor: chartColors[index % chartColors.length],
                tension: 0.1
            };
        });

        return {
            labels: labels,
            datasets: datasets
        };
    }

    function renderChart(data, config = {}) {
        if (salesChart) {
            salesChart.destroy();
        }

        const {
            yAxisTitle = 'Valor Total (R$)',
            secondaryAxisTitle = 'Quantidade de Transações',
            includeSecondaryAxis
        } = config;

        const options = {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: yAxisTitle
                    }
                }
            }
        };

        const shouldIncludeSecondaryAxis = includeSecondaryAxis ?? data.datasets.some(dataset => dataset.yAxisID === 'y1');

        if (shouldIncludeSecondaryAxis) {
            options.scales.y1 = {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: secondaryAxisTitle
                },
                grid: {
                    drawOnChartArea: false
                }
            };
        }

        salesChart = new Chart(salesChartCanvas, {
            type: 'line',
            data: data,
            options: options
        });
    }
});
