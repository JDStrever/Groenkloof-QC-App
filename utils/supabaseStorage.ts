
import { supabase } from '../supabaseClient';
import { Run, Delivery, MrlRecord, CommodityData, CartonConfig, RunConfig, User } from '../types';

// --- Runs ---

export const fetchRuns = async (): Promise<Run[]> => {
    const { data, error } = await supabase.from('frutia_runs').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching runs:', error); return []; }
    
    return data.map((row: any) => ({
        id: row.id,
        runNumber: row.run_number,
        puc: row.puc,
        farmName: row.farm_name,
        boord: row.boord,
        exporter: row.exporter,
        commodity: row.commodity,
        variety: row.variety,
        sizingData: row.sizing_data || [],
        cartonWeights: row.carton_weights || [],
        cartonEvaluations: row.carton_evaluations || [],
        classEvaluations: row.class_evaluations || [],
        finalPalletQc: row.final_pallet_qc || []
    }));
};

export const createRun = async (run: Run) => {
    const { error } = await supabase.from('frutia_runs').insert({
        id: run.id,
        run_number: run.runNumber,
        puc: run.puc,
        farm_name: run.farmName,
        boord: run.boord,
        exporter: run.exporter,
        commodity: run.commodity,
        variety: run.variety,
        sizing_data: run.sizingData || [],
        carton_weights: run.cartonWeights || [],
        carton_evaluations: run.cartonEvaluations || [],
        class_evaluations: run.classEvaluations || [],
        final_pallet_qc: run.finalPalletQc || []
    });
    if (error) console.error('Error creating run:', error);
};

export const updateRun = async (run: Run) => {
    const { error } = await supabase.from('frutia_runs').update({
        sizing_data: run.sizingData,
        carton_weights: run.cartonWeights,
        carton_evaluations: run.cartonEvaluations,
        class_evaluations: run.classEvaluations,
        final_pallet_qc: run.finalPalletQc
    }).eq('id', run.id);
    if (error) console.error('Error updating run:', error);
};

// --- Deliveries ---

export const fetchDeliveries = async (): Promise<Delivery[]> => {
    const { data, error } = await supabase.from('frutia_deliveries').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching deliveries:', error); return []; }

    return data.map((row: any) => ({
        id: row.id,
        deliveryNote: row.delivery_note,
        dateReceived: row.date_received,
        puc: row.puc,
        farmName: row.farm_name,
        boord: row.boord,
        exporter: row.exporter,
        commodity: row.commodity,
        variety: row.variety,
        inspectionCompletedDate: row.inspection_completed_date,
        externalQuality: row.external_quality,
        defects: row.defects,
        internalQuality: row.internal_quality,
        photos: row.photos
    }));
};

export const createDelivery = async (delivery: Delivery) => {
    const { error } = await supabase.from('frutia_deliveries').insert({
        id: delivery.id,
        delivery_note: delivery.deliveryNote,
        date_received: delivery.dateReceived,
        puc: delivery.puc,
        farm_name: delivery.farmName,
        boord: delivery.boord,
        exporter: delivery.exporter,
        commodity: delivery.commodity,
        variety: delivery.variety,
        inspection_completed_date: delivery.inspectionCompletedDate,
        external_quality: delivery.externalQuality,
        defects: delivery.defects,
        internal_quality: delivery.internalQuality,
        photos: delivery.photos
    });
    if (error) console.error('Error creating delivery:', error);
};

export const updateDelivery = async (delivery: Delivery) => {
    const { error } = await supabase.from('frutia_deliveries').update({
        external_quality: delivery.externalQuality,
        defects: delivery.defects,
        internal_quality: delivery.internalQuality,
        photos: delivery.photos,
        inspection_completed_date: delivery.inspectionCompletedDate
    }).eq('id', delivery.id);
    if (error) console.error('Error updating delivery:', error);
};

// --- MRLs ---

export const fetchMrls = async (): Promise<MrlRecord[]> => {
    const { data, error } = await supabase.from('frutia_mrls').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching MRLs:', error); return []; }

    return data.map((row: any) => ({
        id: row.id,
        customerRef: row.customer_ref,
        producer: row.producer,
        puc: row.puc,
        phc: row.phc,
        orchard: row.orchard,
        dateCaptured: row.date_captured,
        commodity: row.commodity,
        variety: row.variety,
        residues: row.residues,
        customResidues: row.custom_residues,
        labReportPdf: row.lab_report_pdf
    }));
};

export const createMrl = async (mrl: MrlRecord) => {
    const { error } = await supabase.from('frutia_mrls').insert({
        id: mrl.id,
        customer_ref: mrl.customerRef,
        producer: mrl.producer,
        puc: mrl.puc,
        phc: mrl.phc,
        orchard: mrl.orchard,
        date_captured: mrl.dateCaptured,
        commodity: mrl.commodity,
        variety: mrl.variety,
        residues: mrl.residues,
        custom_residues: mrl.customResidues,
        lab_report_pdf: mrl.labReportPdf
    });
    if (error) console.error('Error creating MRL:', error);
};

// --- Settings (CommodityData, CartonConfig, RunConfig, Users) ---

export const fetchSetting = async <T>(key: string, defaultValue: T): Promise<T> => {
    const { data, error } = await supabase.from('frutia_settings').select('value').eq('key', key).single();
    if (error || !data) return defaultValue;
    return data.value as T;
};

export const saveSetting = async <T>(key: string, value: T) => {
    const { error } = await supabase.from('frutia_settings').upsert({ key, value });
    if (error) console.error(`Error saving setting ${key}:`, error);
};
