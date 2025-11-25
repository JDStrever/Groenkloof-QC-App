import { CartonConfig, BoxType } from "../types";

const mapBoxTypes = (types: string[]): BoxType[] => types.map(name => ({ name, minWeight: '', maxWeight: '' }));

export const DEFAULT_CARTON_CONFIG: CartonConfig = {
    classes: ['Select', 'VSA', 'Klas 1', 'Klas 2', 'PP', 'RSA1'],
    boxTypes: {
        'Orange': mapBoxTypes([
            'A15C', 'E15D', 'D15D', 'F15D', '1kg bag', '2kg bag', '3kg bag'
        ]),
        'Mandarin': mapBoxTypes([
            'E10D', 'D10D', 'D09D', 'A07D', 'E15D', 'D15D', 'H15D', 'F15D', 
            'F16D', 'A11D', 'A10D', '1kg bag', '2kg bag', '3kg bag'
        ]),
        'Lemon': mapBoxTypes([
            'A15C', 'E15D', 'D15D', '1kg bag', '2kg bag', '3kg bag'
        ]),
        'Grapefruit': []
    }
};