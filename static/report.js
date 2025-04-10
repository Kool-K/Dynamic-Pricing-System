document.addEventListener('DOMContentLoaded', function () {
    // Hardcoded test data
    const testData = [
        { name: "Punjabi Masala Papad", total_sold: 100 },
        { name: "Besan Laddoo", total_sold: 80 },
        { name: "Mango Pickle", total_sold: 120 }
    ];

    const chart = document.getElementById('chart');
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];

    // Find the maximum total_sold value
    const maxTotalSold = Math.max(...testData.map(item => item.total_sold));

    testData.forEach((item, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.backgroundColor = colors[index];

        // Calculate the height of the bar based on the total_sold value
        const barHeight = (item.total_sold / maxTotalSold) * 250;
        bar.style.height = `${barHeight}px`;
        bar.style.position = 'relative';

        // Label on top of bar (initially hidden)
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = item.name;
        label.style.opacity = 0;
        label.style.position = 'absolute';
        label.style.bottom = `${barHeight + 10}px`;
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.fontWeight = 'bold';
        label.style.color = colors[index];
        label.style.transition = 'opacity 0.6s ease-in';

        // Reveal label with delay
        setTimeout(() => {
            label.style.opacity = 1;
        }, 800 + index * 500);

        bar.appendChild(label);

        // Value label inside the bar
        const valueLabel = document.createElement('span');
        valueLabel.textContent = `${item.total_sold}`;
        valueLabel.style.position = 'absolute';
        valueLabel.style.bottom = '0';
        valueLabel.style.left = '50%';
        valueLabel.style.transform = 'translateX(-50%)';
        valueLabel.style.fontSize = '0.8rem';
        valueLabel.style.color = 'white';
        bar.appendChild(valueLabel);

        chart.appendChild(bar);
    });

    // Sprinkle confetti all over the page
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * window.innerWidth}px`;
        confetti.style.top = `${-50 + Math.random() * 50}px`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
        confetti.style.animationDelay = `${Math.random()}s`;

        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 2500);
    }
});
