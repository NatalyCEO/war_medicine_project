// Data processor for CSV files
class DataProcessor {
    constructor() {
        this.data = {
            fronts: {
                totalLosses: 0,
                sanitaryLosses: 0,
                irretrievableLosses: 0
            },
            fleet: {
                totalLosses: 0,
                sanitaryLosses: 0,
                irretrievableLosses: 0
            }
        };
    }

    async loadCSV(filePath) {
        try {
            // Try fetch first
            const response = await fetch(filePath);
            if (response.ok) {
                const text = await response.text();
                return this.parseCSV(text);
            }
        } catch (fetchError) {
            console.warn(`Fetch failed for ${filePath}, trying XMLHttpRequest:`, fetchError);
        }

        // Fallback to XMLHttpRequest
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', filePath, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(this.parseCSV(xhr.responseText));
                    } else {
                        console.error(`Error loading ${filePath}:`, xhr.status, xhr.statusText);
                        resolve(null);
                    }
                }
            };
            xhr.send();
        });
    }

    parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) return null;

        const headers = lines[0].split(';');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(';');
            if (values.length < 2) continue;

            const row = {};
            headers.forEach((header, index) => {
                // Убираем кавычки и пробелы
                let value = values[index] ? values[index].trim() : '';
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                row[header.trim()] = value;
            });
            data.push(row);
        }

        return { headers, data };
    }

    parseNumber(value) {
        if (!value || value === '') return 0;
        // Заменяем запятую на точку для парсинга
        const num = parseFloat(value.replace(',', '.'));
        return isNaN(num) ? 0 : num;
    }

    async processAllData() {
        // Загрузка данных потерь по видам для диаграмм (using static data)
        const lossesByType = null; // Not needed since we use static data

        // Обработка данных фронтов
        const frontsTotal = await this.loadCSV('Общая таблица_фронты_все потери.csv');
        const frontsSanitary = await this.loadCSV('Общая таблица_фронты_санитарные.csv');
        const frontsIrretrievable = await this.loadCSV('Общая таблица_фронты_безвозвратные.csv');

        // Обработка данных флота
        const fleetTotal = await this.loadCSV('Общая таблица_флот_все потери.csv');
        const fleetSanitary = await this.loadCSV('Общая таблица_флот_санитарные.csv');
        const fleetIrretrievable = await this.loadCSV('Общая таблица_флот_безвозвратные.csv');

        // Суммирование данных фронтов
        if (frontsTotal && frontsTotal.data) {
            frontsTotal.data.forEach(row => {
                const total = this.parseNumber(row['Всего потерь_Количество_Всего']);
                this.data.fronts.totalLosses += total;
            });
        }

        if (frontsSanitary && frontsSanitary.data) {
            frontsSanitary.data.forEach(row => {
                const sanitary = this.parseNumber(row['Итого санитарных потерь_Количество_Всего']);
                this.data.fronts.sanitaryLosses += sanitary;
            });
        }

        if (frontsIrretrievable && frontsIrretrievable.data) {
            frontsIrretrievable.data.forEach(row => {
                const irretrievable = this.parseNumber(row['Итого безвозвратных потерь_Количество_Всего']);
                this.data.fronts.irretrievableLosses += irretrievable;
            });
        }

        // Суммирование данных флота
        if (fleetTotal && fleetTotal.data) {
            fleetTotal.data.forEach(row => {
                const total = this.parseNumber(row['Всего потерь_Количество_Всего']);
                this.data.fleet.totalLosses += total;
            });
        }

        if (fleetSanitary && fleetSanitary.data) {
            fleetSanitary.data.forEach(row => {
                const sanitary = this.parseNumber(row['Итого санитарных потерь_Количество_Всего']);
                this.data.fleet.sanitaryLosses += sanitary;
            });
        }

        if (fleetIrretrievable && fleetIrretrievable.data) {
            fleetIrretrievable.data.forEach(row => {
                const irretrievable = this.parseNumber(row['Итого безвозвратных потерь_Количество_Всего']);
                this.data.fleet.irretrievableLosses += irretrievable;
            });
        }

        // Итоговые данные согласно правкам
        // Всего санитарных потерь – 22 326905
        // Из них возвращено в строй 17157243
        // Уволены с исключением с учета или отправлены в отпуск по ранению (болезни) – 3 798158
        // Умерло – 1371504

        const totalSanitaryLosses = 22326905;
        const returnedToDuty = 17157243;
        const discharged = 3798158;
        const died = 1371504;
        const returnRate = Math.round((returnedToDuty / totalSanitaryLosses) * 100);

        // Обработка данных потерь по видам для диаграмм
        const lossesByTypeData = this.processLossesByType(lossesByType);
        console.log('Losses by type data processed:', lossesByTypeData);

        return {
            totalSanitaryLosses,
            returnedToDuty,
            discharged,
            died,
            returnRate,
            fronts: this.data.fronts,
            fleet: this.data.fleet,
            totalLosses: this.data.fronts.totalLosses + this.data.fleet.totalLosses,
            formationsComparison: await this.getFormationsComparison(),
            lossesByType: lossesByTypeData
        };
    }

    processLossesByType(lossesData) {
        // Use static data instead of loading from CSV
        const result = {
            'Убитые и умершие на этапах санитарной эвакуации': {
                years: [1941, 1942, 1943, 1944, 1945],
                values: [391359, 1304277, 1559962, 1204170, 559417]
            },
            'Пропавшие без вести, попавшие в плен': {
                years: [1941, 1942, 1943, 1944, 1945],
                values: [1700099, 1251891, 346548, 155707, 59383]
            },
            'Небоевые потери': {
                years: [1941, 1942, 1943, 1944, 1945],
                values: [182060, 139337, 70194, 51174, 24211]
            },
            'Раненые, контуженные': {
                years: [1941, 1942, 1943, 1944, 1945],
                values: [1112892, 3318974, 4601745, 3966814, 1844973]
            },
            'Заболевшие': {
                years: [1941, 1942, 1943, 1944, 1945],
                values: [53294, 552243, 1377937, 1567996, 665076]
            },
            'Обмороженные': {
                years: [1941, 1942, 1943, 1944, 1945],
                values: [12341, 46088, 14792, 3248, 1072]
            },
            'Безвозвратные потери (флот)': {
                years: [1941, 1942, 1943, 1944, 1945],
                values: [59803, 73897, 10769, 8596, 676]
            },
            'Санитарные потери (флот)': {
                years: [1941, 1942, 1943, 1944, 1945],
                values: [21780, 21523, 16712, 20431, 4427]
            }
        };

        return result;
    }

    async getFormationsComparison() {
        console.log('getFormationsComparison called');

        // Встроенные тестовые данные на случай проблем с загрузкой CSV
        const testData = {
            fronts: [
                {
                    name: 'Ленинградский фронт',
                    days: 1353,
                    wounded: 949761,
                    sanitaryPercent: 73.36,
                    returnRate: 5.53
                },
                {
                    name: 'Волховский фронт',
                    days: 746,
                    wounded: 550714,
                    sanitaryPercent: 69.08,
                    returnRate: 7.88
                },
                {
                    name: '3-й Прибалтийский фронт',
                    days: 179,
                    wounded: 153876,
                    sanitaryPercent: 78.10,
                    returnRate: 9.48
                }
            ],
            armies: [
                {
                    name: '7-я отдельная армия',
                    days: 883,
                    wounded: 56425,
                    sanitaryPercent: 69.87,
                    returnRate: 2.18
                },
                {
                    name: 'Отдельная Приморская армия',
                    days: 504,
                    wounded: 56069,
                    sanitaryPercent: 79.91,
                    returnRate: 3.69
                }
            ],
            fleets: [
                {
                    name: 'Балтийский флот',
                    days: 1418,
                    wounded: 35702,
                    sanitaryPercent: 38.98,
                    returnRate: 0.79
                },
                {
                    name: 'Северный флот',
                    days: 1418,
                    wounded: 25277,
                    sanitaryPercent: 69.86,
                    returnRate: 1.02
                },
                {
                    name: 'Тихоокеанский флот',
                    days: 25,
                    wounded: 300,
                    sanitaryPercent: 23.11,
                    returnRate: 0.18
                }
            ]
        };

        // Используем комбинацию: сначала пытаемся загрузить CSV, если не получается - тестовые данные
        try {
            console.log('Trying to load CSV data...');
            const frontsData = await this.loadCSV('Общая таблица_фронты_санитарные.csv');
            const fleetData = await this.loadCSV('Общая таблица_флот_санитарные.csv');
            console.log('CSV data loaded:', { frontsData: !!frontsData, fleetData: !!fleetData });

            const selectedFormations = {
                fronts: [],
                armies: [],
                fleets: []
            };

            // Выбор ключевых фронтов для сравнения
            if (frontsData && frontsData.data) {
                const keyFronts = [
                    'Ленинградский фронт',
                    'Волховский фронт (1-е и 2-е формирование)',
                    '3-ий Прибалтийский фронт'
                ];

                keyFronts.forEach(frontName => {
                    const front = frontsData.data.find(row => row['Фронт, армия'] === frontName);
                    if (front) {
                        selectedFormations.fronts.push({
                            name: front['Фронт, армия'],
                            days: this.parseNumber(front['Количество суток']),
                            wounded: this.parseNumber(front['Итого санитарных потерь_Количество_Всего']),
                            sanitaryPercent: this.parseNumber(front['Итого санитарных потерь_% к потерям_Всего']),
                            returnRate: this.parseNumber(front['Итого санитарных потерь_% среднемесячных потерь к численности личного состава_Всего'])
                        });
                    }
                });

                // Выбор ключевых армий для сравнения
                const keyArmies = [
                    '7-ая отдельная армия',
                    'Отдельная Приморская армия (2-е формирование)'
                ];

                keyArmies.forEach(armyName => {
                    const army = frontsData.data.find(row => row['Фронт, армия'] === armyName);
                    if (army) {
                        selectedFormations.armies.push({
                            name: army['Фронт, армия'],
                            days: this.parseNumber(army['Количество суток']),
                            wounded: this.parseNumber(army['Итого санитарных потерь_Количество_Всего']),
                            sanitaryPercent: this.parseNumber(army['Итого санитарных потерь_% к потерям_Всего']),
                            returnRate: this.parseNumber(army['Итого санитарных потерь_% среднемесячных потерь к численности личного состава_Всего'])
                        });
                    }
                });
            }

            // Выбор ключевых флотов для сравнения
            if (fleetData && fleetData.data) {
                const keyFleets = [
                    'Балтийский флот',
                    'Северный флот',
                    'Тихоокеанский флот'
                ];

                keyFleets.forEach(fleetName => {
                    const fleet = fleetData.data.find(row => row['Флот, флотилия'] === fleetName);
                    if (fleet) {
                        selectedFormations.fleets.push({
                            name: fleet['Флот, флотилия'],
                            days: this.parseNumber(fleet['Количество суток']),
                            wounded: this.parseNumber(fleet['Итого санитарных потерь_Количество_Всего']),
                            sanitaryPercent: this.parseNumber(fleet['Итого санитарных потерь_% к потерям_Всего']),
                            returnRate: this.parseNumber(fleet['Итого санитарных потерь_% среднемесячных потерь к численности личного состава_Всего'])
                        });
                    }
                });
            }

            // Если удалось загрузить хотя бы некоторые данные из CSV, используем их
            const hasCSVData = selectedFormations.fronts.length > 0 || selectedFormations.armies.length > 0 || selectedFormations.fleets.length > 0;

            if (hasCSVData) {
                console.log('Using CSV data:', selectedFormations);
                return selectedFormations;
            } else {
                console.warn('No CSV data loaded successfully, using test data');
                return testData;
            }
        } catch (error) {
            console.error('Error loading formations data, using test data:', error);
            return testData;
        }
    }
}

// Экспорт для использования в других модулях
if (typeof window !== 'undefined') {
    window.DataProcessor = DataProcessor;
}
