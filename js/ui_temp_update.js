updateTheme(baseTheme) {
    // preserve base theme if passed, otherwise check body class
    let currentTheme = baseTheme || document.body.className;

    // If Adulthood, check wealth for dynamic overrides
    if (state.phase === 'adulthood') {
        const netWorth = Game.calculateFinancials().netWorth;
        if (netWorth > 1000000) {
            document.body.className = 'theme-adult theme-rich';
        } else if (netWorth < 0) {
            document.body.className = 'theme-adult theme-poor';
        } else {
            document.body.className = 'theme-adult';
        }
    }
},
