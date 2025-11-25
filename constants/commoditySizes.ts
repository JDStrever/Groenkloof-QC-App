import { Size, CommodityData } from "../types";

export const COMMODITY_SIZES: CommodityData = {
    'Orange': [
        { code: 'Overs', diameterRange: '100mm+', min: 100, max: 999 },
        { code: '36', diameterRange: '97-100mm', min: 97, max: 100 },
        { code: '40', diameterRange: '90-96mm', min: 90, max: 96 },
        { code: '48', diameterRange: '86-89mm', min: 86, max: 89 },
        { code: '56', diameterRange: '82-85mm', min: 82, max: 85 },
        { code: '64', diameterRange: '78-81mm', min: 78, max: 81 },
        { code: '72', diameterRange: '73-77mm', min: 73, max: 77 },
        { code: '88', diameterRange: '69-72mm', min: 69, max: 72 },
        { code: '105', diameterRange: '65-68mm', min: 65, max: 68 },
        { code: '125', diameterRange: '62-64mm', min: 62, max: 64 },
        { code: '144', diameterRange: '60-62mm', min: 60, max: 62 },
        { code: 'Unders', diameterRange: '0-60mm', min: 0, max: 60 },
    ],
    'Lemon': [
        { code: 'Overs', diameterRange: '85mm+', min: 85, max: 999 },
        { code: '40', diameterRange: '82-85mm', min: 82, max: 85 },
        { code: '48', diameterRange: '79-82mm', min: 79, max: 82 },
        { code: '56', diameterRange: '76-79mm', min: 76, max: 79 },
        { code: '64', diameterRange: '72-75mm', min: 72, max: 75 },
        { code: '75', diameterRange: '69-72mm', min: 69, max: 72 },
        { code: '88', diameterRange: '66-69mm', min: 66, max: 69 },
        { code: '100', diameterRange: '63-66mm', min: 63, max: 66 },
        { code: '113', diameterRange: '59-63mm', min: 59, max: 63 },
        { code: '138', diameterRange: '56-59mm', min: 56, max: 59 },
        { code: '162', diameterRange: '54-56mm', min: 54, max: 56 },
        { code: '189', diameterRange: '51-56mm', min: 51, max: 56 },
        { code: '216', diameterRange: '48-51mm', min: 48, max: 51 },
        { code: 'Unders', diameterRange: '0-48mm', min: 0, max: 48 },
    ],
    'Grapefruit': [
        { code: '23', diameterRange: '119mm+', min: 119, max: 999 },
        { code: '27', diameterRange: '110-119mm', min: 110, max: 119 },
        { code: '32', diameterRange: '105-114mm', min: 105, max: 114 },
        { code: '36', diameterRange: '100-109mm', min: 100, max: 109 },
        { code: '40', diameterRange: '95-104mm', min: 95, max: 104 },
        { code: '48', diameterRange: '88-97mm', min: 88, max: 97 },
        { code: '56', diameterRange: '81-90mm', min: 81, max: 90 },
    ],
    'Mandarin': [ // Soft Citrus
        { code: 'Overs', diameterRange: '85mm+', min: 85, max: 999 },
        { code: '1XXXX', diameterRange: '82-85mm', min: 82, max: 85 },
        { code: '1XXX', diameterRange: '77-82mm', min: 77, max: 82 },
        { code: '1XX', diameterRange: '72-77mm', min: 72, max: 77 },
        { code: '1X', diameterRange: '68-71mm', min: 68, max: 71 },
        { code: '1', diameterRange: '64-67mm', min: 64, max: 67 },
        { code: '2', diameterRange: '59-63mm', min: 59, max: 63 },
        { code: '3', diameterRange: '55-58mm', min: 55, max: 58 },
        { code: '4', diameterRange: '51-54mm', min: 51, max: 54 },
        { code: '5', diameterRange: '48-50mm', min: 48, max: 50 },
        { code: '6', diameterRange: '46-48mm', min: 46, max: 48 },
        { code: 'Unders', diameterRange: '0-46mm', min: 0, max: 46 },
    ]
};

export const DEFECTS = [
    'Letsels', 'Misvorm', 'Oleo', 'Oorryp', 'Kraakskil', 'Dopluis',
    'Beserings', 'Blaaspootjie', 'Inseksteek', 'Sonbrand', 'Bolwurm', 'Witluis'
];