document.addEventListener('sharedContentLoaded', () => {
    const salesReportForm = document.getElementById('salesReportForm');
    const reportResult = document.getElementById('reportResult');
    const salesChartCanvas = document.getElementById('salesChart');
    let salesChart = null;

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
            if (reportType === 'venda') {
                data = await fetchVendasPorDia(startDate, endDate);
                const chartData = processVendasPorDiaData(data);
                renderChart(chartData);
            } else {
                data = await fetchVendasPorCategoria(startDate, endDate);
                const chartData = processVendasPorCategoriaData(data);
                renderChart(chartData);
            }
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

    function processVendasPorDiaData(data) {
        // Ordena por data
        const sortedData = data.sort((a, b) => new Date(a.data) - new Date(b.data));
        
        const labels = sortedData.map(item => {
            const date = new Date(item.data);
            return date.toLocaleDateString('pt-BR');
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
        // Agrupa por categoria e ordena por data
        const categories = [...new Set(data.map(item => item.categoriaNome))];
        
        // Normaliza as datas para comparação (remove a parte de hora se houver)
        const normalizeDate = (dateStr) => {
            return new Date(dateStr).toISOString().split('T')[0];
        };
        
        const dates = [...new Set(data.map(item => normalizeDate(item.data)))].sort((a, b) => new Date(a) - new Date(b));
        
        const labels = dates.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('pt-BR');
        });

        const datasets = categories.map((category, index) => {
            const colors = [
                'rgb(75, 192, 192)',
                'rgb(255, 99, 132)',
                'rgb(255, 205, 86)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)'
            ];
            
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
                borderColor: colors[index % colors.length],
                tension: 0.1
            };
        });

        return {
            labels: labels,
            datasets: datasets
        };
    }

    function renderChart(data) {
        if (salesChart) {
            salesChart.destroy();
        }

        const options = {
            scales: {
                y: {
                    beginAtZero: true,
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Valor Total (R$)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Quantidade de Transações'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        };

        // Se for relatório por categoria, remove o eixo y1
        if (data.datasets.length > 0 && !data.datasets[0].yAxisID) {
            delete options.scales.y1;
        }

        salesChart = new Chart(salesChartCanvas, {
            type: 'line',
            data: data,
            options: options
        });
    }
});