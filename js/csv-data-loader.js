// CSV Data Loader - загружает и обрабатывает все CSV файлы
console.log('csv-data-loader.js START');
class CSVDataLoader {
    constructor() {
        this.allUnits = [];
        this.frontsData = [];
        this.fleetData = [];
        this._fallbackData = null;
    }

    get fallbackData() {
        if (!this._fallbackData) {
            this._fallbackData = this.getFallbackData();
        }
        return this._fallbackData;
    }

    async loadAllData() {
        try {
            // Сначала пробуем загрузить CSV
            const csvData = await this.tryLoadCSV();
            if (csvData && csvData.length > 0) {
                return csvData;
            }

            // Если CSV не загрузились, используем встроенные данные
            return this.fallbackData;
        } catch (error) {
            return this.fallbackData;
        }
    }

    async tryLoadCSV() {
        try {
            // Загружаем данные фронтов
            const frontsTotal = await this.loadCSV('Общая таблица_фронты_все потери.csv');
            const frontsSanitary = await this.loadCSV('Общая таблица_фронты_санитарные.csv');
            const frontsIrretrievable = await this.loadCSV('Общая таблица_фронты_безвозвратные.csv');

            // Загружаем данные флота
            const fleetTotal = await this.loadCSV('Общая таблица_флот_все потери.csv');
            const fleetSanitary = await this.loadCSV('Общая таблица_флот_санитарные.csv');
            const fleetIrretrievable = await this.loadCSV('Общая таблица_флот_безвозвратные.csv');

            // Обрабатываем данные фронтов
            if (frontsTotal && frontsTotal.data) {
                this.frontsData = this.processFrontsData(frontsTotal, frontsSanitary, frontsIrretrievable);
            }

            // Обрабатываем данные флота
            if (fleetTotal && fleetTotal.data) {
                this.fleetData = this.processFleetData(fleetTotal, fleetSanitary, fleetIrretrievable);
            }

            // Объединяем все данные
            this.allUnits = [...this.frontsData, ...this.fleetData];

            return this.allUnits;
        } catch (error) {
            throw error;
        }
    }

    getFallbackData() {
        // Встроенные данные из CSV файлов для надежности (тестовый набор)
        const data = [
            { name: "3-ий Белорусский фронт", type: "front", days: 381, totalLosses: 843427, sanitaryLosses: 667297, irretrievableLosses: 176130, killed: 161686, wounded: 556485, missing: 9292, nonCombat: 5152, sick: 0, frostbite: 0, daily: 2214 },
            { name: "3-ий Прибалтийский фронт", type: "front", days: 179, totalLosses: 197031, sanitaryLosses: 153876, irretrievableLosses: 43155, killed: 37710, wounded: 130427, missing: 2533, nonCombat: 912, sick: 0, frostbite: 0, daily: 1101 },
            { name: "37-ая отдельная армия", type: "front", days: 146, totalLosses: 4725, sanitaryLosses: 4299, irretrievableLosses: 426, killed: 2, wounded: 2, missing: 0, nonCombat: 424, sick: 0, frostbite: 0, daily: 32 },
            { name: "4-ая отдельная армия", type: "front", days: 80, totalLosses: 44131, sanitaryLosses: 26388, irretrievableLosses: 17743, killed: 16943, wounded: 24468, missing: 5390, nonCombat: 1407, sick: 0, frostbite: 0, daily: 552 },
            { name: "51-ая отдельная армия", type: "front", days: 94, totalLosses: 68055, sanitaryLosses: 15852, irretrievableLosses: 52203, killed: 14388, wounded: 12020, missing: 32173, nonCombat: 10550, sick: 0, frostbite: 0, daily: 724 },
            { name: "52-отдельная армия", type: "front", days: 81, totalLosses: 21794, sanitaryLosses: 8035, irretrievableLosses: 13759, killed: 7435, wounded: 3557, missing: 9638, nonCombat: 564, sick: 0, frostbite: 0, daily: 269 },
            { name: "7-ая отдельная армия", type: "front", days: 883, totalLosses: 80762, sanitaryLosses: 56425, irretrievableLosses: 24337, killed: 15792, wounded: 35305, missing: 7010, nonCombat: 1535, sick: 0, frostbite: 0, daily: 91 },
            { name: "Брянский фронт (1-е и 2-е формирование)", type: "front", days: 529, totalLosses: 586847, sanitaryLosses: 283738, irretrievableLosses: 303109, killed: 244467, wounded: 101940, missing: 190311, nonCombat: 10858, sick: 0, frostbite: 0, daily: 1109 },
            { name: "Войска Московской зоны обороны", type: "front", days: 667, totalLosses: 8883, sanitaryLosses: 5797, irretrievableLosses: 3086, killed: 894, wounded: 1267, missing: 740, nonCombat: 1452, sick: 0, frostbite: 0, daily: 13 },
            { name: "Волховский фронт (1-е и 2-е формирование)", type: "front", days: 746, totalLosses: 965857, sanitaryLosses: 667234, irretrievableLosses: 298623, killed: 198709, wounded: 550714, missing: 89323, nonCombat: 10591, sick: 0, frostbite: 0, daily: 1295 },
            { name: "Воронежский фронт и 1-ый Украинский фронт", type: "front", days: 1036, totalLosses: 2600892, sanitaryLosses: 1883964, irretrievableLosses: 716928, killed: 501398, wounded: 1632518, missing: 182125, nonCombat: 33405, sick: 0, frostbite: 0, daily: 2510 },
            { name: "Восточный и Сталинградский (2-е формирование) фронты", type: "front", days: 147, totalLosses: 342595, sanitaryLosses: 161297, irretrievableLosses: 181298, killed: 150743, wounded: 108436, missing: 104490, nonCombat: 10477, sick: 0, frostbite: 0, daily: 2331 },
            { name: "Забайкальский фронт", type: "front", days: 25, totalLosses: 8383, sanitaryLosses: 6155, irretrievableLosses: 2228, killed: 1683, wounded: 3159, missing: 23, nonCombat: 522, sick: 0, frostbite: 0, daily: 335 },
            { name: "Закавказский фронт (2-е формирование)", type: "front", days: 320, totalLosses: 366594, sanitaryLosses: 212436, irretrievableLosses: 154158, killed: 72689, wounded: 171519, missing: 72329, nonCombat: 9140, sick: 0, frostbite: 0, daily: 1146 },
            { name: "Западный фронт", type: "front", days: 1037, totalLosses: 3534275, sanitaryLosses: 1998986, irretrievableLosses: 1535289, killed: 586336, wounded: 1703521, missing: 866604, nonCombat: 82349, sick: 0, frostbite: 0, daily: 3408 },
            { name: "Кавказский фронт", type: "front", days: 29, totalLosses: 44782, sanitaryLosses: 14235, irretrievableLosses: 30547, killed: 9549, wounded: 7904, missing: 20392, nonCombat: 2251, sick: 0, frostbite: 0, daily: 1544 },
            { name: "Калининский фронт, 1-ый Прибалтийский фронт, Земландская группа войск", type: "front", days: 1262, totalLosses: 2172891, sanitaryLosses: 1551762, irretrievableLosses: 621129, killed: 490646, wounded: 1296481, missing: 100298, nonCombat: 30185, sick: 0, frostbite: 0, daily: 1721 },
            { name: "Карельский фронт", type: "front", days: 1172, totalLosses: 420260, sanitaryLosses: 309825, irretrievableLosses: 110435, killed: 75535, wounded: 179995, missing: 30545, nonCombat: 4355, sick: 0, frostbite: 0, daily: 359 },
            { name: "Крымский фронт", type: "front", days: 111, totalLosses: 278043, sanitaryLosses: 83236, irretrievableLosses: 194807, killed: 75747, wounded: 31051, missing: 161890, nonCombat: 1866, sick: 0, frostbite: 0, daily: 2505 },
            { name: "Ленинградский фронт", type: "front", days: 1353, totalLosses: 1754898, sanitaryLosses: 1287373, irretrievableLosses: 467525, killed: 332059, wounded: 949761, missing: 111142, nonCombat: 24324, sick: 0, frostbite: 0, daily: 1296 },
            { name: "Отдельная Приморская армия (2-е формирование)", type: "front", days: 504, totalLosses: 70163, sanitaryLosses: 56069, irretrievableLosses: 14094, killed: 32361, wounded: 32361, missing: 1663, nonCombat: 784, sick: 0, frostbite: 0, daily: 139 },
            { name: "Прибалтийский и 2-ой Прибалтийский фронты", type: "front", days: 539, totalLosses: 864428, sanitaryLosses: 679168, irretrievableLosses: 185260, killed: 533559, wounded: 379943, missing: 131118, nonCombat: 4903, sick: 0, frostbite: 0, daily: 1604 },
            { name: "Приморская армия (1-е формирование)", type: "front", days: 310, totalLosses: 162612, sanitaryLosses: 57844, irretrievableLosses: 104768, killed: 53220, wounded: 12020, missing: 84221, nonCombat: 4187, sick: 0, frostbite: 0, daily: 524 },
            { name: "Резервный (2-е формирование), Курский, Орловский, Брянский (3-е формирование)", type: "front", days: 213, totalLosses: 318266, sanitaryLosses: 235069, irretrievableLosses: 83197, killed: 73997, wounded: 214737, missing: 8192, nonCombat: 1308, sick: 0, frostbite: 0, daily: 1492 },
            { name: "Резервный фронт (1-е формирование)", type: "front", days: 76, totalLosses: 323761, sanitaryLosses: 139720, irretrievableLosses: 184041, killed: 38455, wounded: 118451, missing: 138630, nonCombat: 6956, sick: 0, frostbite: 0, daily: 4257 },
            { name: "Северный фронт", type: "front", days: 64, totalLosses: 148364, sanitaryLosses: 62905, irretrievableLosses: 85459, killed: 60271, wounded: 22334, missing: 61537, nonCombat: 1588, sick: 0, frostbite: 0, daily: 2318 },
            { name: "Северо-Кавказский фронт (1-е формирование)", type: "front", days: 107, totalLosses: 125089, sanitaryLosses: 35752, irretrievableLosses: 89337, killed: 30451, wounded: 21938, missing: 68875, nonCombat: 5301, sick: 0, frostbite: 0, daily: 1169 },
            { name: "Северо-Кавказский фронт (2-е формирование)", type: "front", days: 301, totalLosses: 509289, sanitaryLosses: 379985, irretrievableLosses: 129304, killed: 286504, wounded: 210549, missing: 23876, nonCombat: 5924, sick: 0, frostbite: 0, daily: 1692 },
            { name: "Северо-западный фронт", type: "front", days: 882, totalLosses: 1164646, sanitaryLosses: 709321, irretrievableLosses: 455325, killed: 591161, wounded: 446587, missing: 192441, nonCombat: 2311, sick: 0, frostbite: 0, daily: 1321 },
            { name: "Сталинградский (1-е формирование) и Донской фронты", type: "front", days: 218, totalLosses: 791954, sanitaryLosses: 362911, irretrievableLosses: 429043, killed: 270099, wounded: 248031, missing: 223692, nonCombat: 21133, sick: 0, frostbite: 0, daily: 3633 },
            { name: "Степной, 2-ой Украинский фронты", type: "front", days: 671, totalLosses: 1579163, sanitaryLosses: 1208773, irretrievableLosses: 370390, killed: 1012938, wounded: 764871, missing: 195542, nonCombat: 9086, sick: 0, frostbite: 0, daily: 2355 },
            { name: "Центральный (2-е формирование), Белорусский (1-е и 2-е формирования), 1-ый Белорусский (1-е и 2-е формирования)", type: "front", days: 815, totalLosses: 1988751, sanitaryLosses: 1504360, irretrievableLosses: 484391, killed: 410928, wounded: 909182, missing: 163321, nonCombat: 20657, sick: 0, frostbite: 0, daily: 2440 },
            { name: "Центральный фронт (1-е формирование)", type: "front", days: 32, totalLosses: 143005, sanitaryLosses: 31997, irretrievableLosses: 111008, killed: 31650, wounded: 22920, missing: 45824, nonCombat: 347, sick: 0, frostbite: 0, daily: 4469 },
            { name: "Юго-Западный (2-е формирование) и 3-ий Украинский", type: "front", days: 928, totalLosses: 1618001, sanitaryLosses: 1207625, irretrievableLosses: 410376, killed: 1016158, wounded: 746988, missing: 186371, nonCombat: 5096, sick: 0, frostbite: 0, daily: 1744 },
            { name: "Юго-Западный фронт (1-е формирование)", type: "front", days: 386, totalLosses: 1321628, sanitaryLosses: 304530, irretrievableLosses: 1017098, killed: 271067, wounded: 211716, missing: 843443, nonCombat: 13296, sick: 0, frostbite: 0, daily: 3424 },
            { name: "Южный (2-е формирование) и 4-ый Украинский фронты", type: "front", days: 795, totalLosses: 1269463, sanitaryLosses: 952345, irretrievableLosses: 317118, killed: 820837, wounded: 620296, missing: 127854, nonCombat: 3654, sick: 0, frostbite: 0, daily: 1597 },
            { name: "Южный фронт (1-е формирование)", type: "front", days: 399, totalLosses: 792689, sanitaryLosses: 344030, irretrievableLosses: 448659, killed: 282970, wounded: 216302, missing: 305430, nonCombat: 20195, sick: 0, frostbite: 0, daily: 1987 },

            // Флоты и флотилии
            { name: "Амурская военная флотилия", type: "fleet", days: 25, totalLosses: 123, sanitaryLosses: 91, irretrievableLosses: 32, killed: 32, wounded: 47, missing: 0, nonCombat: 0, sick: 0, frostbite: 0, daily: 5 },
            { name: "Балтийский флот", type: "fleet", days: 1418, totalLosses: 91592, sanitaryLosses: 35702, irretrievableLosses: 55890, killed: 19836, wounded: 25509, missing: 32709, nonCombat: 3345, sick: 0, frostbite: 0, daily: 65 },
            { name: "Волжская военная флотилия", type: "fleet", days: 280, totalLosses: 951, sanitaryLosses: 329, irretrievableLosses: 622, killed: 174, wounded: 324, missing: 397, nonCombat: 51, sick: 0, frostbite: 0, daily: 3 },
            { name: "Днепропетровская военная флотилия", type: "fleet", days: 604, totalLosses: 474, sanitaryLosses: 113, irretrievableLosses: 361, killed: 278, wounded: 113, missing: 26, nonCombat: 57, sick: 0, frostbite: 0, daily: 1 },
            { name: "Пинская военная флотилия", type: "fleet", days: 99, totalLosses: 707, sanitaryLosses: 193, irretrievableLosses: 514, killed: 82, wounded: 193, missing: 430, nonCombat: 2, sick: 0, frostbite: 0, daily: 7 },
            { name: "Северный флот", type: "fleet", days: 1418, totalLosses: 36182, sanitaryLosses: 25277, irretrievableLosses: 10905, killed: 7854, wounded: 24047, missing: 1743, nonCombat: 1308, sick: 0, frostbite: 0, daily: 25 },
            { name: "Тихоокеанский флот", type: "fleet", days: 25, totalLosses: 1298, sanitaryLosses: 300, irretrievableLosses: 998, killed: 903, wounded: 286, missing: 95, nonCombat: 0, sick: 0, frostbite: 0, daily: 52 },
            { name: "Черноморский флот", type: "fleet", days: 1183, totalLosses: 105083, sanitaryLosses: 22689, irretrievableLosses: 82394, killed: 16942, wounded: 19036, missing: 59379, nonCombat: 6073, sick: 0, frostbite: 0, daily: 89 }
        ];
        return data;
    }

    async loadCSV(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                console.warn(`Could not load ${filePath}`);
                return null;
            }
            const text = await response.text();
            return this.parseCSV(text);
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            return null;
        }
    }

    parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) return null;

        const headers = lines[0].split(';');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(';');
            if (values.length < 2 || !values[0] || values[0].trim() === '') continue;

            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : '';
            });
            data.push(row);
        }

        return { headers, data };
    }

    parseNumber(value) {
        if (!value || value === '') return 0;
        const num = parseFloat(value.replace(',', '.').replace(/\s/g, ''));
        return isNaN(num) ? 0 : num;
    }

    processFrontsData(totalData, sanitaryData, irretrievableData) {
        const units = [];
        const sanitaryMap = new Map();
        const irretrievableMap = new Map();

        // Создаем карты для быстрого поиска
        if (sanitaryData && sanitaryData.data) {
            sanitaryData.data.forEach(row => {
                const name = row['Фронт,армия'] || row['Фронт, армия'] || '';
                if (name) sanitaryMap.set(name, row);
            });
        }

        if (irretrievableData && irretrievableData.data) {
            irretrievableData.data.forEach(row => {
                const name = row['Фронт,армия'] || row['Фронт, армия'] || '';
                if (name) irretrievableMap.set(name, row);
            });
        }

        // Обрабатываем основные данные
        totalData.data.forEach(row => {
            const name = row['Фронт, армия'] || row['Фронт,армия'] || '';
            if (!name) return;

            const days = this.parseNumber(row['Количество суток']);
            const totalLosses = this.parseNumber(row['Всего потерь_Количество_Всего']);
            
            const sanitaryRow = sanitaryMap.get(name);
            const irretrievableRow = irretrievableMap.get(name);

            const sanitaryLosses = sanitaryRow ?
                this.parseNumber(sanitaryRow['Итого санитарных потерь_Количество_Всего']) : 0;

            const irretrievableLosses = irretrievableRow ?
                this.parseNumber(irretrievableRow['Итого безвозвратных потерь_Количество_Всего']) : 0;

            // Извлекаем данные о безвозвратных потерях
            const killed = irretrievableRow ?
                this.parseNumber(irretrievableRow['Убито и умерло на этапах санитарной эвакуации_Количество_Всего']) : 0;
            const missing = irretrievableRow ?
                this.parseNumber(irretrievableRow['Пропало без вести, попало в плен_Количество_Всего']) : 0;
            const nonCombat = irretrievableRow ?
                this.parseNumber(irretrievableRow['Небоевые потери_Количество_Всего']) : 0;

            // Извлекаем данные о санитарных потерях по категориям
            const sick = sanitaryRow ?
                this.parseNumber(sanitaryRow['Заболело_Количество_Всего']) : 0;
            const frostbite = sanitaryRow ?
                this.parseNumber(sanitaryRow['Обморожено_Количество_Всего']) : 0;

            // Пересчитываем общие потери как сумму всех категорий
            const calculatedTotalLosses = killed + missing + nonCombat + sick + frostbite + sanitaryLosses;

            const daily = days > 0 ? Math.round(calculatedTotalLosses / days) : 0;

            units.push({
                name: name,
                type: 'front',
                days: days,
                totalLosses: calculatedTotalLosses,
                sanitaryLosses: sanitaryLosses,
                irretrievableLosses: irretrievableLosses,
                killed: killed,
                missing: missing,
                nonCombat: nonCombat,
                sick: sick,
                frostbite: frostbite,
                wounded: sanitaryLosses, // Санитарные потери включают раненых
                daily: daily
            });
        });

        return units;
    }

    processFleetData(totalData, sanitaryData, irretrievableData) {
        const units = [];
        const sanitaryMap = new Map();
        const irretrievableMap = new Map();

        if (sanitaryData && sanitaryData.data) {
            sanitaryData.data.forEach(row => {
                const name = row['Флот, флотилия'] || '';
                if (name) sanitaryMap.set(name, row);
            });
        }

        if (irretrievableData && irretrievableData.data) {
            irretrievableData.data.forEach(row => {
                const name = row['Флот, флотилия'] || '';
                if (name) irretrievableMap.set(name, row);
            });
        }

        totalData.data.forEach(row => {
            const name = row['Флот, флотилия'] || '';
            if (!name) return;

            const days = this.parseNumber(row['Количество суток']);
            const totalLosses = this.parseNumber(row['Всего потерь_Количество_Всего']);
            
            const sanitaryRow = sanitaryMap.get(name);
            const irretrievableRow = irretrievableMap.get(name);

            const sanitaryLosses = sanitaryRow ? 
                this.parseNumber(sanitaryRow['Итого санитарных потерь_Количество_Всего']) : 0;
            
            const irretrievableLosses = irretrievableRow ? 
                this.parseNumber(irretrievableRow['Итого безвозвратных потерь_Количество_Всего']) : 0;

            const killed = irretrievableRow ?
                this.parseNumber(irretrievableRow['Убито и умерло на этапах санитарной эвакуации_Количество_Всего']) : 0;
            const missing = irretrievableRow ?
                this.parseNumber(irretrievableRow['Пропало без вести, попало в плен_Количество_Всего']) : 0;
            const nonCombat = irretrievableRow ?
                this.parseNumber(irretrievableRow['Небоевые потери_Количество_Всего']) : 0;

            // Извлекаем данные о санитарных потерях по категориям для флота
            const sick = sanitaryRow ?
                this.parseNumber(sanitaryRow['Заболело_Количество_Всего']) : 0;
            const frostbite = sanitaryRow ?
                this.parseNumber(sanitaryRow['Обморожено_Количество_Всего']) : 0;

            // Пересчитываем общие потери как сумму всех категорий для флота
            const calculatedTotalLosses = killed + missing + nonCombat + sick + frostbite + sanitaryLosses;

            const daily = days > 0 ? Math.round(calculatedTotalLosses / days) : 0;

            units.push({
                name: name,
                type: 'fleet',
                days: days,
                totalLosses: calculatedTotalLosses,
                sanitaryLosses: sanitaryLosses,
                irretrievableLosses: irretrievableLosses,
                killed: killed,
                missing: missing,
                nonCombat: nonCombat,
                sick: sick,
                frostbite: frostbite,
                wounded: sanitaryLosses,
                daily: daily
            });
        });

        return units;
    }

    getAllUnits() {
        return this.allUnits;
    }

    getFrontsOnly() {
        return this.allUnits.filter(u => u.type === 'front');
    }

    getFleetOnly() {
        return this.allUnits.filter(u => u.type === 'fleet');
    }

    getUnitByName(name) {
        return this.allUnits.find(u => u.name === name);
    }
}

// Экспорт для использования
if (typeof window !== 'undefined') {
    window.CSVDataLoader = CSVDataLoader;
}
console.log('csv-data-loader.js END');