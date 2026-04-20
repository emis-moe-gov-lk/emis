<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ZonalEducationOfficeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $zonalOffices = [
            // Western Province Zones (PDE0000001)
            array('workplace_id' => 'ZEO0000001', 'peo_wp_id' => 'PDE0000001', 'district_id' => NULL, 'name' => 'Colombo Zonal Education Office', 'short_name' => 'Colombo Zone'),
            array('workplace_id' => 'ZEO0000002', 'peo_wp_id' => 'PDE0000001', 'district_id' => NULL, 'name' => 'Piliyandala Zonal Education Office', 'short_name' => 'Piliyandala Zone'),
            array('workplace_id' => 'ZEO0000003', 'peo_wp_id' => 'PDE0000001', 'district_id' => NULL, 'name' => 'Sri Jayawardhanapura Zonal Education Office', 'short_name' => 'Sri Jayawardhanapura Zone'),
            array('workplace_id' => 'ZEO0000004', 'peo_wp_id' => 'PDE0000001', 'district_id' => NULL, 'name' => 'Homagama Zonal Education Office', 'short_name' => 'Homagama Zone'),
            array('workplace_id' => 'ZEO0000005', 'peo_wp_id' => 'PDE0000001', 'district_id' => NULL, 'name' => 'Kelaniya Zonal Education Office', 'short_name' => 'Kelaniya Zone'),
            array('workplace_id' => 'ZEO0000006', 'peo_wp_id' => 'PDE0000001', 'district_id' => NULL, 'name' => 'Negombo Zonal Education Office', 'short_name' => 'Negombo Zone'),
            array('workplace_id' => 'ZEO0000007', 'peo_wp_id' => 'PDE0000001', 'district_id' => NULL, 'name' => 'Minuwangoda Zonal Education Office', 'short_name' => 'Minuwangoda Zone'),
            array('workplace_id' => 'ZEO0000008', 'peo_wp_id' => 'PDE0000001', 'district_id' => NULL, 'name' => 'Gampaha Zonal Education Office', 'short_name' => 'Gampaha Zone'),
            array('workplace_id' => 'ZEO0000009', 'peo_wp_id' => 'PDE0000001', 'district_id' => NULL, 'name' => 'Kalutara Zonal Education Office', 'short_name' => 'Kalutara Zone'),
            array('workplace_id' => 'ZEO0000010', 'peo_wp_id' => 'PDE0000001', 'district_id' => NULL, 'name' => 'Horana Zonal Education Office ', 'short_name' => 'Horana Zone '),
            array('workplace_id' => 'ZEO0000011', 'peo_wp_id' => 'PDE0000001', 'district_id' => NULL, 'name' => 'Matugama Zonal Education Office', 'short_name' => 'Matugama Zone'),
            
            // Central Province Zones (PDE0000002)
            array('workplace_id' => 'ZEO0000012', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Katugastota Zonal Education Office', 'short_name' => 'Katugastota Zone'),
            array('workplace_id' => 'ZEO0000013', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Waththegama Zonal Education Office', 'short_name' => 'Waththegama Zone'),
            array('workplace_id' => 'ZEO0000014', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Teldeniya Zonal Education Office ', 'short_name' => 'Teldeniya Zone '),
            array('workplace_id' => 'ZEO0000015', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Kandy Zonal Education Office ', 'short_name' => 'Kandy Zone '),
            array('workplace_id' => 'ZEO0000016', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Denuwara Zonal Education Office ', 'short_name' => 'Denuwara Zone '),
            array('workplace_id' => 'ZEO0000017', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Gampola Zonal Education Office ', 'short_name' => 'Gampola Zone '),
            array('workplace_id' => 'ZEO0000018', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Galewela Zonal Education Office', 'short_name' => 'Galewela Zone'),
            array('workplace_id' => 'ZEO0000019', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Naula Zonal Education Office', 'short_name' => 'Naula Zone'),
            array('workplace_id' => 'ZEO0000020', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Wilgamuwa Zonal Education Office', 'short_name' => 'Wilgamuwa Zone'),
            array('workplace_id' => 'ZEO0000021', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Matale Zonal Education Office', 'short_name' => 'Matale Zone'),
            array('workplace_id' => 'ZEO0000022', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Nuwaraeliya  Zonal Education Office', 'short_name' => 'Nuwaraeliya  Zone'),
            array('workplace_id' => 'ZEO0000023', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Hatton Zonal Education Office', 'short_name' => 'Hatton Zone'),
            array('workplace_id' => 'ZEO0000024', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Kotmale Zonal Education Office', 'short_name' => 'Kotmale Zone'),
            array('workplace_id' => 'ZEO0000025', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Walapane Zonal Education Office', 'short_name' => 'Walapane Zone'),
            array('workplace_id' => 'ZEO0000026', 'peo_wp_id' => 'PDE0000002', 'district_id' => NULL, 'name' => 'Hanguranketha Zonal Education Office', 'short_name' => 'Hanguranketha Zone'),

            // Southern Province Zones (PDE0000003)
            array('workplace_id' => 'ZEO0000027', 'peo_wp_id' => 'PDE0000003', 'district_id' => NULL, 'name' => 'Ambalangoda Zonal Education Office', 'short_name' => 'Ambalangoda Zone'),
            array('workplace_id' => 'ZEO0000028', 'peo_wp_id' => 'PDE0000003', 'district_id' => NULL, 'name' => 'Galle Zonal Education Office', 'short_name' => 'Galle Zone'),
            array('workplace_id' => 'ZEO0000029', 'peo_wp_id' => 'PDE0000003', 'district_id' => NULL, 'name' => 'Elpitiya Zonal Education Office', 'short_name' => 'Elpitiya Zone'),
            array('workplace_id' => 'ZEO0000030', 'peo_wp_id' => 'PDE0000003', 'district_id' => NULL, 'name' => 'Udugama Zonal Education Office', 'short_name' => 'Udugama Zone'),
            array('workplace_id' => 'ZEO0000031', 'peo_wp_id' => 'PDE0000003', 'district_id' => NULL, 'name' => 'Deniyaya (Morawaka) Zonal Education Office', 'short_name' => 'Deniyaya (Morawaka) Zone'),
            array('workplace_id' => 'ZEO0000032', 'peo_wp_id' => 'PDE0000003', 'district_id' => NULL, 'name' => 'Akuressa Zonal Education Office', 'short_name' => 'Akuressa Zone'),
            array('workplace_id' => 'ZEO0000033', 'peo_wp_id' => 'PDE0000003', 'district_id' => NULL, 'name' => 'Mulatiyana (Hakmana) Zonal Education Office', 'short_name' => 'Mulatiyana (Hakmana) Zone'),
            array('workplace_id' => 'ZEO0000034', 'peo_wp_id' => 'PDE0000003', 'district_id' => NULL, 'name' => 'Matara Zonal Education Office', 'short_name' => 'Matara Zone'),
            array('workplace_id' => 'ZEO0000035', 'peo_wp_id' => 'PDE0000003', 'district_id' => NULL, 'name' => 'Walasmulla Zonal Education Office', 'short_name' => 'Walasmulla Zone'),
            array('workplace_id' => 'ZEO0000036', 'peo_wp_id' => 'PDE0000003', 'district_id' => NULL, 'name' => 'Tangalle Zonal Education Office', 'short_name' => 'Tangalle Zone'),
            array('workplace_id' => 'ZEO0000037', 'peo_wp_id' => 'PDE0000003', 'district_id' => NULL, 'name' => 'Hambantota Zonal Education Office', 'short_name' => 'Hambantota Zone'),
            
            // Northern Province Zones (PDE0000004)
            
            array('workplace_id' => 'ZEO0000039', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Islands Zonal Education Office', 'short_name' => 'Islands Zone'),
            array('workplace_id' => 'ZEO0000040', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Walikamam Zonal Education Office', 'short_name' => 'Walikamam Zone'),
            array('workplace_id' => 'ZEO0000041', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Jaffana Zonal Education Office', 'short_name' => 'Jaffana Zone'),
            array('workplace_id' => 'ZEO0000042', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Wadamarachchi Zonal Education Office', 'short_name' => 'Wadamarachchi Zone'),
            array('workplace_id' => 'ZEO0000043', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Thenmarachchi Zonal Education Office', 'short_name' => 'Thenmarachchi Zone'),
            array('workplace_id' => 'ZEO0000044', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Kilinochchi South Zonal Education Office', 'short_name' => 'Kilinochchi South Zone'),
            array('workplace_id' => 'ZEO0000045', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Kilinochchi North Zonal Education Office', 'short_name' => 'Kilinochchi North Zone'),
            array('workplace_id' => 'ZEO0000046', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Mannar Zonal Education Office', 'short_name' => 'Mannar Zone'),
            array('workplace_id' => 'ZEO0000047', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Madu Zonal Education Office', 'short_name' => 'Madu Zone'),
            array('workplace_id' => 'ZEO0000049', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Mullaitivu Zonal Education Office', 'short_name' => 'Mullaitivu Zone'),
            array('workplace_id' => 'ZEO0000050', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Thunukkai Zonal Education Office', 'short_name' => 'Thunukkai Zone'),
            array('workplace_id' => 'ZEO0000051', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Vavniya South Division Department Of Education', 'short_name' => 'Vavniya Division'),
            array('workplace_id' => 'ZEO0000052', 'peo_wp_id' => 'PDE0000004', 'district_id' => NULL, 'name' => 'Vavniya North Zonal Education Office', 'short_name' => 'Vavniya North Zone'),
            

            // Eastern Province Zones (PDE0000005)
            array('workplace_id' => 'ZEO0000053', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Kalkudah Zonal Education Office', 'short_name' => 'Kalkudah Zone'),
            array('workplace_id' => 'ZEO0000054', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Batticaloa Central Zonal Education Office', 'short_name' => 'Batticaloa Central Zone'),
            array('workplace_id' => 'ZEO0000055', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Batticaloa West Zonal Education Office', 'short_name' => 'Batticaloa West Zone'),
            array('workplace_id' => 'ZEO0000056', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Batticaloa Zonal Education Office', 'short_name' => 'Batticaloa Zone'),
            array('workplace_id' => 'ZEO0000057', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Paddrippu Zonal Education Office', 'short_name' => 'Paddrippu Zone'),
            array('workplace_id' => 'ZEO0000058', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Mahaoya Zonal Education Office', 'short_name' => 'Mahaoya Zone'),
            array('workplace_id' => 'ZEO0000059', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Ampara Zonal Education Office', 'short_name' => 'Ampara Zone'),
            array('workplace_id' => 'ZEO0000060', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Dehiattakandiya Zonal Education Office', 'short_name' => 'Dehiattakandiya Zone'),
            array('workplace_id' => 'ZEO0000062', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Sammanthurai Zonal Education Office', 'short_name' => 'Sammanthurai Zone'),
            array('workplace_id' => 'ZEO0000063', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Kalmunai Zonal Education Office', 'short_name' => 'Kalmunai Zone'),
            array('workplace_id' => 'ZEO0000064', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Akkaraipattu Zonal Education Office', 'short_name' => 'Akkaraipattu Zone'),
            array('workplace_id' => 'ZEO0000065', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Thirukkovil Zonal Education Office', 'short_name' => 'Thirukkovil Zone'),
            array('workplace_id' => 'ZEO0000066', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Trincomale North Zonal Education Office', 'short_name' => 'Trincomale North Zone'),
            array('workplace_id' => 'ZEO0000067', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Trincomale Zonal Education Office', 'short_name' => 'Trincomale Zone'),
            array('workplace_id' => 'ZEO0000068', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Kinniya Zonal Education Office', 'short_name' => 'Kinniya Zone'),
            array('workplace_id' => 'ZEO0000069', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Kantale Zonal Education Office', 'short_name' => 'Kantale Zone'),
            array('workplace_id' => 'ZEO0000070', 'peo_wp_id' => 'PDE0000005', 'district_id' => NULL, 'name' => 'Mutur Zonal Education Office', 'short_name' => 'Mutur Zone'),

            // North Western Province Zones (PDE0000006)
            array('workplace_id' => 'ZEO0000048', 'peo_wp_id' => 'PDE0000006', 'district_id' => NULL, 'name' => 'Puttalam Zonal Education Office', 'short_name' => 'Puttalam Zone'),
            array('workplace_id' => 'ZEO0000071', 'peo_wp_id' => 'PDE0000006', 'district_id' => NULL, 'name' => 'Kurunegala Zonal Education Office', 'short_name' => 'Kurunegala Zone'),
            array('workplace_id' => 'ZEO0000072', 'peo_wp_id' => 'PDE0000006', 'district_id' => NULL, 'name' => 'Ibbagamuwa Zonal Education Office', 'short_name' => 'Ibbagamuwa Zone'),
            array('workplace_id' => 'ZEO0000073', 'peo_wp_id' => 'PDE0000006', 'district_id' => NULL, 'name' => 'Nikaweratiya Zonal Education Office', 'short_name' => 'Nikaweratiya Zone'),
            array('workplace_id' => 'ZEO0000074', 'peo_wp_id' => 'PDE0000006', 'district_id' => NULL, 'name' => 'Giriulla Zonal Education Office', 'short_name' => 'Giriulla Zone'),
            array('workplace_id' => 'ZEO0000075', 'peo_wp_id' => 'PDE0000006', 'district_id' => NULL, 'name' => 'Kuliyapitiya Zonal Education Office', 'short_name' => 'Kuliyapitiya Zone'),
            array('workplace_id' => 'ZEO0000076', 'peo_wp_id' => 'PDE0000006', 'district_id' => NULL, 'name' => 'Maho Zonal Education Office', 'short_name' => 'Maho Zone'),
            array('workplace_id' => 'ZEO0000077', 'peo_wp_id' => 'PDE0000006', 'district_id' => NULL, 'name' => 'Chilaw Zonal Education Office', 'short_name' => 'Chilaw Zone'),

            // North Central Province Zones (PDE0000007)
            array('workplace_id' => 'ZEO0000061', 'peo_wp_id' => 'PDE0000007', 'district_id' => NULL, 'name' => 'Dimbulagala Zonal Education Office', 'short_name' => 'Dimbulagala Zone'),
            array('workplace_id' => 'ZEO0000078', 'peo_wp_id' => 'PDE0000007', 'district_id' => NULL, 'name' => 'Kebithigollewa Zonal Education Office', 'short_name' => 'Kebithigollewa Zone'),
            array('workplace_id' => 'ZEO0000079', 'peo_wp_id' => 'PDE0000007', 'district_id' => NULL, 'name' => 'Anuradhapura Zonal Education Office', 'short_name' => 'Anuradhapura Zone'),
            array('workplace_id' => 'ZEO0000080', 'peo_wp_id' => 'PDE0000007', 'district_id' => NULL, 'name' => 'Galenbindunuwewa Zonal Education Office', 'short_name' => 'Galenbindunuwewa Zone'),
            array('workplace_id' => 'ZEO0000081', 'peo_wp_id' => 'PDE0000007', 'district_id' => NULL, 'name' => 'Tambuttegama Zonal Education Office', 'short_name' => 'Tambuttegama Zone'),
            array('workplace_id' => 'ZEO0000082', 'peo_wp_id' => 'PDE0000007', 'district_id' => NULL, 'name' => 'Kekirawa Zonal Education Office', 'short_name' => 'Kekirawa Zone'),
            array('workplace_id' => 'ZEO0000083', 'peo_wp_id' => 'PDE0000007', 'district_id' => NULL, 'name' => 'Hingurakgoda Zonal Education Office', 'short_name' => 'Hingurakgoda Zone'),
            array('workplace_id' => 'ZEO0000084', 'peo_wp_id' => 'PDE0000007', 'district_id' => NULL, 'name' => 'Polonnaruwa Zonal Education Office', 'short_name' => 'Polonnaruwa Zone'),
            
            // Uva Province Zones (PDE0000008)
            array('workplace_id' => 'ZEO0000038', 'peo_wp_id' => 'PDE0000008', 'district_id' => NULL, 'name' => 'Tanamalwila Zonal Education Office', 'short_name' => 'Tanamalwila Zone'),
            array('workplace_id' => 'ZEO0000085', 'peo_wp_id' => 'PDE0000008', 'district_id' => NULL, 'name' => 'Mahiyanganaya Zonal Education Office', 'short_name' => 'Mahiyanganaya Zone'),
            array('workplace_id' => 'ZEO0000086', 'peo_wp_id' => 'PDE0000008', 'district_id' => NULL, 'name' => 'Viyaluwa Zonal Education Office', 'short_name' => 'Viyaluwa Zone'),
            array('workplace_id' => 'ZEO0000087', 'peo_wp_id' => 'PDE0000008', 'district_id' => NULL, 'name' => 'Passara Zonal Education Office', 'short_name' => 'Passara Zone'),
            array('workplace_id' => 'ZEO0000088', 'peo_wp_id' => 'PDE0000008', 'district_id' => NULL, 'name' => 'Badulla Zonal Education Office', 'short_name' => 'Badulla Zone'),
            array('workplace_id' => 'ZEO0000089', 'peo_wp_id' => 'PDE0000008', 'district_id' => NULL, 'name' => 'Bandarawela Zonal Education Office', 'short_name' => 'Bandarawela Zone'),
            array('workplace_id' => 'ZEO0000090', 'peo_wp_id' => 'PDE0000008', 'district_id' => NULL, 'name' => 'Welimada Zonal Education Office', 'short_name' => 'Welimada Zone'),
            array('workplace_id' => 'ZEO0000091', 'peo_wp_id' => 'PDE0000008', 'district_id' => NULL, 'name' => 'Bibile Zonal Education Office', 'short_name' => 'Bibile Zone'),
            array('workplace_id' => 'ZEO0000092', 'peo_wp_id' => 'PDE0000008', 'district_id' => NULL, 'name' => 'Monaragala Zonal Education Office', 'short_name' => 'Monaragala Zone'),
            array('workplace_id' => 'ZEO0000093', 'peo_wp_id' => 'PDE0000008', 'district_id' => NULL, 'name' => 'Wellawaya Zonal Education Office', 'short_name' => 'Wellawaya Zone'),
            
            

            // Sabaragamuwa Province Zones (PDE0000009)
            array('workplace_id' => 'ZEO0000094', 'peo_wp_id' => 'PDE0000009', 'district_id' => NULL, 'name' => 'Ratnapura Zonal Education Office', 'short_name' => 'Ratnapura Zone'),
            array('workplace_id' => 'ZEO0000095', 'peo_wp_id' => 'PDE0000009', 'district_id' => NULL, 'name' => 'Balangoda Zonal Education Office', 'short_name' => 'Balangoda Zone'),
            array('workplace_id' => 'ZEO0000096', 'peo_wp_id' => 'PDE0000009', 'district_id' => NULL, 'name' => 'Embilipitiya Zonal Education Office', 'short_name' => 'Embilipitiya Zone'),
            array('workplace_id' => 'ZEO0000097', 'peo_wp_id' => 'PDE0000009', 'district_id' => NULL, 'name' => 'Nivitigala Zonal Education Office', 'short_name' => 'Nivitigala Zone'),
            array('workplace_id' => 'ZEO0000098', 'peo_wp_id' => 'PDE0000009', 'district_id' => NULL, 'name' => 'Dehiowita Zonal Education Office', 'short_name' => 'Dehiowita Zone'),
            array('workplace_id' => 'ZEO0000099', 'peo_wp_id' => 'PDE0000009', 'district_id' => NULL, 'name' => 'Kegalle Zonal Education Office', 'short_name' => 'Kegalle Zone'),
            array('workplace_id' => 'ZEO0000100', 'peo_wp_id' => 'PDE0000009', 'district_id' => NULL, 'name' => 'Mawanella Zonal Education Office', 'short_name' => 'Mawanella Zone'),
        ];

        foreach ($zonalOffices as $office) {
            DB::table('zonal_education_offices')->updateOrInsert(
                ['workplace_id' => $office['workplace_id']],
                
                [
                    'peo_wp_id' => $office['peo_wp_id'],
                    'district_id' => $office['district_id'],
                    'name' => $office['name'],
                    'short_name' => $office['short_name'],
                    'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                    'updated_at' => Carbon::now()->format('Y-m-d H:i:s'),
                ]
            );
        }
    }
}
