<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DivisionalEducationOfficeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisionalOffices = [
            //Western
            // Colombo Zonal Education Office
            array("workplace_id" => "DEO0000001", "zeo_wp_id" => "ZEO0000001", "name" => "Colombo North Divisional Education Office", "short_name" => "Colombo North Division"),
            array("workplace_id" => "DEO0000002", "zeo_wp_id" => "ZEO0000001", "name" => "Colombo Central Divisional Education Office", "short_name" => "Colombo Central Division"),
            array("workplace_id" => "DEO0000003", "zeo_wp_id" => "ZEO0000001", "name" => "Borella Divisional Education Office", "short_name" => "Borella Division"),
            array("workplace_id" => "DEO0000004", "zeo_wp_id" => "ZEO0000001", "name" => "Colombo South Divisional Education Office", "short_name" => "Colombo South Division"),

            //Piliyandala Zonal Education Office
            array("workplace_id" => "DEO0000005", "zeo_wp_id" => "ZEO0000002", "name" => "Dehiwala Divisional Education Office", "short_name" => "Dehiwala Division"),
            array("workplace_id" => "DEO0000008", "zeo_wp_id" => "ZEO0000002", "name" => "Moratuwa Divisional Education Office", "short_name" => "Moratuwa Division"),
            array("workplace_id" => "DEO0000014", "zeo_wp_id" => "ZEO0000002", "name" => "Kesbewa Divisional Education Office", "short_name" => "Kesbewa Division"),

            //Sri Jayawardanapura Zonal Education Office
            array("workplace_id" => "DEO0000006", "zeo_wp_id" => "ZEO0000003", "name" => "Kolonnawa Divisional Education Office", "short_name" => "Kolonnawa Division"),
            array("workplace_id" => "DEO0000007", "zeo_wp_id" => "ZEO0000003", "name" => "Nugegoda Divisional Education Office", "short_name" => "Nugegoda Division"),
            array("workplace_id" => "DEO0000013", "zeo_wp_id" => "ZEO0000003", "name" => "Maharagma Divisional Education Office", "short_name" => "Maharagma Division"),
            array("workplace_id" => "DEO0000009", "zeo_wp_id" => "ZEO0000003", "name" => "Kaduwela Divisional Education Office", "short_name" => "Kaduwela Division"),

            //Homagama Zonal Education Office
            array("workplace_id" => "DEO0000012", "zeo_wp_id" => "ZEO0000004", "name" => "Homagama Divisional Education Office", "short_name" => "Homagama Division"),
            array("workplace_id" => "DEO0000010", "zeo_wp_id" => "ZEO0000004", "name" => "Hanwella Divisional Education Office", "short_name" => "Hanwella Division"),
            array("workplace_id" => "DEO0000011", "zeo_wp_id" => "ZEO0000004", "name" => "Padukka Divisional Education Office", "short_name" => "Padukka Division"),

            //Kelaniya Zonal Education Office
            array("workplace_id" => "DEO0000023", "zeo_wp_id" => "ZEO0000005", "name" => "Kelaniya Divisional Education Office", "short_name" => "Kelaniya Division"),
            array("workplace_id" => "DEO0000015", "zeo_wp_id" => "ZEO0000005", "name" => "Wattala Divisional Education Office", "short_name" => "Wattala Division"),
            array("workplace_id" => "DEO0000022", "zeo_wp_id" => "ZEO0000005", "name" => "Biyagama Divisional Education Office", "short_name" => "Biyagama Division"),
            array("workplace_id" => "DEO0000020", "zeo_wp_id" => "ZEO0000005", "name" => "Mahara Divisional Education Office", "short_name" => "Mahara Division"),

            //Negombo Zonal Education Office
            array("workplace_id" => "DEO0000024", "zeo_wp_id" => "ZEO0000006", "name" => "Negombo Divisional Education Office", "short_name" => "Negombo Division"),
            array("workplace_id" => "DEO0000025", "zeo_wp_id" => "ZEO0000006", "name" => "Katana Divisional Education Office", "short_name" => "Katana Division"),
            array("workplace_id" => "DEO0000016", "zeo_wp_id" => "ZEO0000006", "name" => "Ja-Ela Divisional Education Office", "short_name" => "Ja-Ela Division"),

            //Minuwangoda Zonal Education Office
            array("workplace_id" => "DEO0000027", "zeo_wp_id" => "ZEO0000007", "name" => "Minuwangoda Divisional Education Office", "short_name" => "Minuwangoda Division"),
            array("workplace_id" => "DEO0000017", "zeo_wp_id" => "ZEO0000007", "name" => "Meerigama Divisional Education Office", "short_name" => "Mirigama Division"),
            array("workplace_id" => "DEO0000026", "zeo_wp_id" => "ZEO0000007", "name" => "Diuvlapitiya Divisional Education Office", "short_name" => "Diuvlapitiya Division"),

            //Gampaha Zonal Education Office
            array("workplace_id" => "DEO0000019", "zeo_wp_id" => "ZEO0000008", "name" => "Gampaha Divisional Education Office", "short_name" => "Gampaha Division"),
            array("workplace_id" => "DEO0000018", "zeo_wp_id" => "ZEO0000008", "name" => "Attanagalla Divisional Education Office", "short_name" => "Attanagalla Division"),
            array("workplace_id" => "DEO0000021", "zeo_wp_id" => "ZEO0000008", "name" => "Dompe Divisional Education Office", "short_name" => "Dompe Division"),

            //Kalutara Zonal Education Office
            array("workplace_id" => "DEO0000035", "zeo_wp_id" => "ZEO0000009", "name" => "Kalutara Divisional Education Office", "short_name" => "Kalutara Division"),
            array("workplace_id" => "DEO0000036", "zeo_wp_id" => "ZEO0000009", "name" => "Beruwala Divisional Education Office", "short_name" => "Beruwala Division"),
            array("workplace_id" => "DEO0000028", "zeo_wp_id" => "ZEO0000009", "name" => "Panadura Divisional Education Office", "short_name" => "Panadura Division"),
            array("workplace_id" => "DEO0000034", "zeo_wp_id" => "ZEO0000009", "name" => "Dodangoda Divisional Education Office", "short_name" => "Dodangoda Division"),

            //Horana Zonal Education Office
            array("workplace_id" => "DEO0000030", "zeo_wp_id" => "ZEO0000010", "name" => "Horana Divisional Education Office", "short_name" => "Horana Division"),
            array("workplace_id" => "DEO0000029", "zeo_wp_id" => "ZEO0000010", "name" => "Bandaragama Divisional Education Office", "short_name" => "Bandaragama Division"),
            array("workplace_id" => "DEO0000031", "zeo_wp_id" => "ZEO0000010", "name" => "Bulathsinhala Divisional Education Office", "short_name" => "Bulathsinhala Division"),

            //Matugama Zonal Education Office
            array("workplace_id" => "DEO0000033", "zeo_wp_id" => "ZEO0000011", "name" => "Matugama Divisional Education Office", "short_name" => "Matugama Division"),
            array("workplace_id" => "DEO0000032", "zeo_wp_id" => "ZEO0000011", "name" => "Agalawatta Divisional Education Office", "short_name" => "Agalawatta 1 Division"),
            array("workplace_id" => "DEO0000037", "zeo_wp_id" => "ZEO0000011", "name" => "Palindanuwara Divisional Education Office", "short_name" => "Palindanuwara Division"),
            array("workplace_id" => "DEO0000038", "zeo_wp_id" => "ZEO0000011", "name" => "Walallawita Divisional Education Office", "short_name" => "Walallawita Division"),


            //Central
            //Katugastota Zonal Education Office
            array("workplace_id" => "DEO0000043", "zeo_wp_id" => "ZEO0000012", "name" => "Harispattuwa Divisional Education Office", "short_name" => "Harispattuwa Division"),
            array("workplace_id" => "DEO0000040", "zeo_wp_id" => "ZEO0000012", "name" => "Galagedara Divisional Education Office", "short_name" => "Galagedara Division"),
            array("workplace_id" => "DEO0000042", "zeo_wp_id" => "ZEO0000012", "name" => "Akurana Divisional Education Office", "short_name" => "Akurana Division"),
            array("workplace_id" => "DEO0000041", "zeo_wp_id" => "ZEO0000012", "name" => "Poojapitiya Divisional Education Office", "short_name" => "Poojapitiya Division"),
            array("workplace_id" => "DEO0000039", "zeo_wp_id" => "ZEO0000012", "name" => "Hatharaliyadda Divisional Education Office", "short_name" => "Hatharaliyadda Division"),

            //Wathegama Zonal Education Office
            array("workplace_id" => "DEO0000049", "zeo_wp_id" => "ZEO0000013", "name" => "Kundasale Divisional Education Office", "short_name" => "Kundasale Division"),
            array("workplace_id" => "DEO0000044", "zeo_wp_id" => "ZEO0000013", "name" => "Pathadumbara Divisional Education Office", "short_name" => "Pathadumbara Division"),
            array("workplace_id" => "DEO0000045", "zeo_wp_id" => "ZEO0000013", "name" => "Panvila Divisional Education Office", "short_name" => "Panvila Division"),

            //Teldeniya Zonal Education Office
            array("workplace_id" => "DEO0000047", "zeo_wp_id" => "ZEO0000014", "name" => "Minipe Divisional Education Office", "short_name" => "Minipe Division"),
            array("workplace_id" => "DEO0000048", "zeo_wp_id" => "ZEO0000014", "name" => "Medadumbara Divisional Education Office", "short_name" => "Medadumbara Division"),
            array("workplace_id" => "DEO0000046", "zeo_wp_id" => "ZEO0000014", "name" => "Udadumbara Divisional Education Office", "short_name" => "Udadumbara Division"),

            //Kandy Zonal Education Office
            array("workplace_id" => "DEO0000051", "zeo_wp_id" => "ZEO0000015", "name" => "Gangawata Korale Divisional Education Office", "short_name" => "Gangawata Korale Division"),
            array("workplace_id" => "DEO0000050", "zeo_wp_id" => "ZEO0000015", "name" => "Pathahewaheta Divisional Education Office", "short_name" => "Pathahewaheta Division"),

            //Denuwara Zonal Education Office
            array("workplace_id" => "DEO0000052", "zeo_wp_id" => "ZEO0000016", "name" => "Yatinuwara Divisional Education Office", "short_name" => "Yatinuwara Division"),
            array("workplace_id" => "DEO0000053", "zeo_wp_id" => "ZEO0000016", "name" => "Udunuwara Divisional Education Office", "short_name" => "Udunuwara Division"),

            //Gampola Zonal Education Office
            array("workplace_id" => "DEO0000054", "zeo_wp_id" => "ZEO0000017", "name" => "Udapalatha Divisional Education Office", "short_name" => "Udapalatha Division"),
            array("workplace_id" => "DEO0000055", "zeo_wp_id" => "ZEO0000017", "name" => "Ganga Ihala Korale Divisional Education Office", "short_name" => "Ganga Ihala Korale Division"),
            array("workplace_id" => "DEO0000056", "zeo_wp_id" => "ZEO0000017", "name" => "Pasbage Korale Divisional Education Office", "short_name" => "Pasbage Korale Division"),


            //Galewela Zonal Education Office
            array("workplace_id" => "DEO0000058", "zeo_wp_id" => "ZEO0000018", "name" => "Galewela Divisional Education Office", "short_name" => "Galewela Division"),
            array("workplace_id" => "DEO0000059", "zeo_wp_id" => "ZEO0000018", "name" => "Pallepola Divisional Education Office", "short_name" => "Pallepola Division"),
            array("workplace_id" => "DEO0000057", "zeo_wp_id" => "ZEO0000018", "name" => "Dambulla Divisional Education Office", "short_name" => "Dambulla Division"),


            //Naula Zonal Education Office
            array("workplace_id" => "DEO0000060", "zeo_wp_id" => "ZEO0000019", "name" => "Naula Divisional Education Office", "short_name" => "Naula Division"),
            array("workplace_id" => "DEO0000063", "zeo_wp_id" => "ZEO0000019", "name" => "Ambanganga Korale Divisional Education Office", "short_name" => "Ambanganga Korale Division"),


            //Wilgamuwa Zonal Education Office
            array("workplace_id" => "DEO0000062", "zeo_wp_id" => "ZEO0000020", "name" => "Wilgamuwa Divisional Education Office", "short_name" => "Wilgamuwa Division"),
            array("workplace_id" => "DEO0000061", "zeo_wp_id" => "ZEO0000020", "name" => "Laggala Divisional Education Office", "short_name" => "Laggala Division"),

            //Matale Zonal Education Office
            array("workplace_id" => "DEO0000064", "zeo_wp_id" => "ZEO0000021", "name" => "Matale Divisional Education Office", "short_name" => "Matale Division"),
            array("workplace_id" => "DEO0000066", "zeo_wp_id" => "ZEO0000021", "name" => "Rattota Divisional Education Office", "short_name" => "Rattota Division"),
            array("workplace_id" => "DEO0000065", "zeo_wp_id" => "ZEO0000021", "name" => "Yatawatta Divisional Education Office", "short_name" => "Yatawatta Division"),
            array("workplace_id" => "DEO0000067", "zeo_wp_id" => "ZEO0000021", "name" => "Ukuwela Divisional Education Office", "short_name" => "Ukuwela Division"),

            //Nuwara Eliya Zonal Education Office
            array("workplace_id" => "DEO0000068", "zeo_wp_id" => "ZEO0000022", "name" => "Nuwara Eliya Divisional Education Office", "short_name" => "Nuwara Eliya Division"),
            array("workplace_id" => "DEO0000069", "zeo_wp_id" => "ZEO0000022", "name" => "Nuwara Eliya Tamil-1 Divisional Education Office", "short_name" => "Nuwara Eliya Tamil-1 Division"),
            array("workplace_id" => "DEO0000074", "zeo_wp_id" => "ZEO0000022", "name" => "Nuwara Eliya Tamil-11 Divisional Education Office", "short_name" => "Nuwara Eliya Tamil-11 Division"),
            array("workplace_id" => "DEO0000075", "zeo_wp_id" => "ZEO0000022", "name" => "Nuwara Eliya Tamil-111 Divisional Education Office", "short_name" => "Nuwara Eliya Tamil-111 Division"),


            //Hatton Zonal Education Office
            array("workplace_id" => "DEO0000070", "zeo_wp_id" => "ZEO0000023", "name" => "Ambagamuwa Divisional Education Office", "short_name" => "Ambagamuwa Division"),
            array("workplace_id" => "DEO0000073", "zeo_wp_id" => "ZEO0000023", "name" => "Hatton Tami-1 Divisional Education Office", "short_name" => "Hatton Tami-1 Division"),
            array("workplace_id" => "DEO0000076", "zeo_wp_id" => "ZEO0000023", "name" => "Hatton Tami-11 Divisional Education Office", "short_name" => "Hatton Tami-11 Division"),
            array("workplace_id" => "DEO0000077", "zeo_wp_id" => "ZEO0000023", "name" => "Hatton Tami-111 Divisional Education Office", "short_name" => "Hatton Tami-111 Division"),

            //Kotmale Zonal Education Office
            array("workplace_id" => "DEO0000071", "zeo_wp_id" => "ZEO0000024", "name" => "Kotmale Divisional Education Office", "short_name" => "Kotmale Division"),

            //Walapane Zonal Education Office
            array("workplace_id" => "DEO0000072", "zeo_wp_id" => "ZEO0000025", "name" => "Walapane Divisional Education Office", "short_name" => "Walapane Division"),

            //Hanguranketha Zonal Education Office
            array("workplace_id" => "DEO0000078", "zeo_wp_id" => "ZEO0000026", "name" => "Udahewaheta Divisional Education Office", "short_name" => "Udahewaheta Division"),


            //Southern
            //Ambalangoda Zonal Education Office
            array("workplace_id" => "DEO0000080", "zeo_wp_id" => "ZEO0000027", "name" => "Ambalangoda Divisional Education Office", "short_name" => "Ambalangoda Division"),
            array("workplace_id" => "DEO0000090", "zeo_wp_id" => "ZEO0000027", "name" => "Hikkaduwa Divisional Education Office", "short_name" => "Hikkaduwa Division"),
            array("workplace_id" => "DEO0000079", "zeo_wp_id" => "ZEO0000027", "name" => "Balapitiya Divisional Education Office", "short_name" => "Balapitiya Division"),

            //Galle Zonal Education Office
            array("workplace_id" => "DEO0000091", "zeo_wp_id" => "ZEO0000028", "name" => "Galle Divisional Education Office", "short_name" => "Galle Division"),
            array("workplace_id" => "DEO0000093", "zeo_wp_id" => "ZEO0000028", "name" => "Habaraduwa Divisional Education Office", "short_name" => "Habaraduwa Division"),
            array("workplace_id" => "DEO0000092", "zeo_wp_id" => "ZEO0000028", "name" => "Akmeemana Divisional Education Office", "short_name" => "Akmeemana Division"),
            array("workplace_id" => "DEO0000081", "zeo_wp_id" => "ZEO0000028", "name" => "Baddegama Divisional Education Office", "short_name" => "Baddegama Division"),


            //Elpitiya Zonal Education Office
            array("workplace_id" => "DEO0000085", "zeo_wp_id" => "ZEO0000029", "name" => "Elpitiya Divisional Education Office", "short_name" => "Elpitiya Division"),
            array("workplace_id" => "DEO0000082", "zeo_wp_id" => "ZEO0000029", "name" => "Karandeniya Divisional Education Office", "short_name" => "Karandeniya Division"),
            array("workplace_id" => "DEO0000084", "zeo_wp_id" => "ZEO0000029", "name" => "Bentota Divisional Education Office", "short_name" => "Bentota Division"),
            array("workplace_id" => "DEO0000083", "zeo_wp_id" => "ZEO0000029", "name" => "Divitura Welivitiya Divisional Education Office", "short_name" => "Divitura Welivitiya Division"),
            array("workplace_id" => "DEO0000087", "zeo_wp_id" => "ZEO0000029", "name" => "Niyagama Divisional Education Office", "short_name" => "Niyagama Division"),


            //Udugama Zonal Education Office
            array("workplace_id" => "DEO0000088", "zeo_wp_id" => "ZEO0000030", "name" => "Mapalagama Divisional Education Office", "short_name" => "Mapalagama Division"),
            array("workplace_id" => "DEO0000089", "zeo_wp_id" => "ZEO0000030", "name" => "Yakkalamulla Divisional Education Office", "short_name" => "Yakkalamulla Division"),
            array("workplace_id" => "DEO0000086", "zeo_wp_id" => "ZEO0000030", "name" => "Tawalama Divisional Education Office", "short_name" => "Tawalama Division"),

            //Deniyaya (Morawaka) Zonal Education Office
            array("workplace_id" => "DEO0000094", "zeo_wp_id" => "ZEO0000031", "name" => "Morawaka Divisional Education Office", "short_name" => "Morawaka Division"),
            array("workplace_id" => "DEO0000097", "zeo_wp_id" => "ZEO0000031", "name" => "Pasgoda Divisional Education Office", "short_name" => "Pasgoda Division"),
            array("workplace_id" => "DEO0000096", "zeo_wp_id" => "ZEO0000031", "name" => "Kotapola Divisional Education Office", "short_name" => "Kotapola Division"),

            //Akuressa Zonal Education Office
            array("workplace_id" => "DEO0000095", "zeo_wp_id" => "ZEO0000032", "name" => "Akuressa Divisional Education Office", "short_name" => "Akuressa Division"),
            array("workplace_id" => "DEO0000100", "zeo_wp_id" => "ZEO0000032", "name" => "Welipitiya Divisional Education Office", "short_name" => "Welipitiya Division"),
            array("workplace_id" => "DEO0000098", "zeo_wp_id" => "ZEO0000032", "name" => "Malimboda Divisional Education Office", "short_name" => "Malimboda Division"),


            //Mulatiyana (Hakmana) Zonal Education Office
            array("workplace_id" => "DEO0000103", "zeo_wp_id" => "ZEO0000033", "name" => "Hakmana Divisional Education Office", "short_name" => "Hakmana Division"),
            array("workplace_id" => "DEO0000101", "zeo_wp_id" => "ZEO0000033", "name" => "Tihagoda Divisional Education Office", "short_name" => "Tihagoda Division"),
            array("workplace_id" => "DEO0000104", "zeo_wp_id" => "ZEO0000033", "name" => "Mulatiyana Divisional Education Office", "short_name" => "Mulatiyana Division"),
            array("workplace_id" => "DEO0000099", "zeo_wp_id" => "ZEO0000033", "name" => "Kamburupitiya Divisional Education Office", "short_name" => "Kamburupitiya Division"),


            //Matara Zonal Education Office
            array("workplace_id" => "DEO0000106", "zeo_wp_id" => "ZEO0000034", "name" => "Matara Divisional Education Office", "short_name" => "Matara Division"),
            array("workplace_id" => "DEO0000105", "zeo_wp_id" => "ZEO0000034", "name" => "Weligama Divisional Education Office", "short_name" => "Weligama Division"),
            array("workplace_id" => "DEO0000102", "zeo_wp_id" => "ZEO0000034", "name" => "Devinuwara Divisional Education Office", "short_name" => "Devinuwara Division"),
            array("workplace_id" => "DEO0000107", "zeo_wp_id" => "ZEO0000034", "name" => "Dikwella Divisional Education Office", "short_name" => "Dikwella Division"),


            //Walasmulla Zonal Education Office
            array("workplace_id" => "DEO0000108", "zeo_wp_id" => "ZEO0000035", "name" => "Walasmulla Divisional Education Office", "short_name" => "Walasmulla Division"),
            array("workplace_id" => "DEO0000109", "zeo_wp_id" => "ZEO0000035", "name" => "Katuwana Divisional Education Office", "short_name" => "Katuwana Division"),


            //Tangalle Zonal Education Office
            array("workplace_id" => "DEO0000110", "zeo_wp_id" => "ZEO0000036", "name" => "Tangalle Divisional Education Office", "short_name" => "Tangalle Division"),
            array("workplace_id" => "DEO0000113", "zeo_wp_id" => "ZEO0000036", "name" => "Beliatta Divisional Education Office", "short_name" => "Beliatta Division"),
            array("workplace_id" => "DEO0000111", "zeo_wp_id" => "ZEO0000036", "name" => "Angunakolapelessa Divisional Education Office", "short_name" => "Angunakolapelessa Division"),


            //Hambantota Zonal Education Office
            array("workplace_id" => "DEO0000115", "zeo_wp_id" => "ZEO0000037", "name" => "Hambantota Divisional Education Office", "short_name" => "Hambantota Division"),
            array("workplace_id" => "DEO0000114", "zeo_wp_id" => "ZEO0000037", "name" => "Tissamaharama Divisional Education Office", "short_name" => "Tissamaharama Division"),
            array("workplace_id" => "DEO0000117", "zeo_wp_id" => "ZEO0000037", "name" => "Sooriyawewa Divisional Education Office", "short_name" => "Sooriyawewa Division"),
            array("workplace_id" => "DEO0000112", "zeo_wp_id" => "ZEO0000037", "name" => "Ambalantota Divisional Education Office", "short_name" => "Ambalantota Division"),
            array("workplace_id" => "DEO0000116", "zeo_wp_id" => "ZEO0000037", "name" => "Lunugamwehera Divisional Education Office", "short_name" => "Lunugamwehera Division"),


            //Nothern
            //Islands Zonal Education Office
            array("workplace_id" => "DEO0000121", "zeo_wp_id" => "ZEO0000039", "name" => "Kayts Divisional Education Office", "short_name" => "Kayts Division"),
            array("workplace_id" => "DEO0000119", "zeo_wp_id" => "ZEO0000039", "name" => "Delfts Divisional Education Office", "short_name" => "Delfts Division"),
            array("workplace_id" => "DEO0000120", "zeo_wp_id" => "ZEO0000039", "name" => "Velanai Divisional Education Office", "short_name" => "Velanai Division"),
            array("workplace_id" => "DEO0000122", "zeo_wp_id" => "ZEO0000039", "name" => "Karainagar Divisional Education Office", "short_name" => "Karainagar Division"),

            //Valikamam Zonal Education Office
            array("workplace_id" => "DEO0000126", "zeo_wp_id" => "ZEO0000040", "name" => "Uduvil Divisional Education Office", "short_name" => "Uduvil Division"),
            array("workplace_id" => "DEO0000124", "zeo_wp_id" => "ZEO0000040", "name" => "Chankanai Divisional Education Office", "short_name" => "Chankanai Division"),
            array("workplace_id" => "DEO0000123", "zeo_wp_id" => "ZEO0000040", "name" => "Sandilipay Divisional Education Office", "short_name" => "Sandilipay Division"),
            array("workplace_id" => "DEO0000125", "zeo_wp_id" => "ZEO0000040", "name" => "Tellipalai Divisional Education Office", "short_name" => "Tellipalai Division"),


            //Jaffna Zonal Education Office
            array("workplace_id" => "DEO0000133", "zeo_wp_id" => "ZEO0000041", "name" => "Jaffana Divisional Education Office", "short_name" => "Jaffana Division"),
            array("workplace_id" => "DEO0000132", "zeo_wp_id" => "ZEO0000041", "name" => "Nallur Divisional Education Office", "short_name" => "Nallur Division"),
            array("workplace_id" => "DEO0000127", "zeo_wp_id" => "ZEO0000041", "name" => "Kopay Divisional Education Office", "short_name" => "Kopay Division"),

            //Vadamarachchi Zonal Education Office
            array("workplace_id" => "DEO0000129", "zeo_wp_id" => "ZEO0000042", "name" => "Point Pedro Divisional Education Office", "short_name" => "Point Pedro Division"),
            array("workplace_id" => "DEO0000128", "zeo_wp_id" => "ZEO0000042", "name" => "Karaveddy Divisional Education Office", "short_name" => "Karaveddy Division"),
            array("workplace_id" => "DEO0000130", "zeo_wp_id" => "ZEO0000042", "name" => "Maruthankerny Divisional Education Office", "short_name" => "Maruthankerny Division"),

            //Thenmarachchi Zonal Education Office
            array("workplace_id" => "DEO0000131", "zeo_wp_id" => "ZEO0000043", "name" => "Chawakachcheri Divisional Education Office", "short_name" => "Chawakachcheri Division"),

            //Kilinochchi South Zonal Education Office
            array("workplace_id" => "DEO0000134", "zeo_wp_id" => "ZEO0000044", "name" => "Karachchi Divisional Education Office", "short_name" => "Karachchi Division"),
            array("workplace_id" => "DEO0000135", "zeo_wp_id" => "ZEO0000044", "name" => "Poonakary Divisional Education Office", "short_name" => "Poonakary Division"),

            //Kilinochchi North Zonal Education Office
            array("workplace_id" => "DEO0000136", "zeo_wp_id" => "ZEO0000045", "name" => "Kandawalai Divisional Education Office", "short_name" => "Kandawalai Division"),
            array("workplace_id" => "DEO0000137", "zeo_wp_id" => "ZEO0000045", "name" => "Pallai Divisional Education Office", "short_name" => "Pallai Division"),

            //Mannar Zonal Education Office
            array("workplace_id" => "DEO0000138", "zeo_wp_id" => "ZEO0000046", "name" => "Mannar Divisional Education Office", "short_name" => "Mannar Division"),
            array("workplace_id" => "DEO0000140", "zeo_wp_id" => "ZEO0000046", "name" => "Musali Divisional Education Office", "short_name" => "Musali Division"),
            array("workplace_id" => "DEO0000139", "zeo_wp_id" => "ZEO0000046", "name" => "Nanattan Divisional Education Office", "short_name" => "Nanaddan Division"),

            //Madhu Zonal Education Office
            array("workplace_id" => "DEO0000141", "zeo_wp_id" => "ZEO0000047", "name" => "Madhu Divisional Education Office", "short_name" => "Madu Division"),
            array("workplace_id" => "DEO0000142", "zeo_wp_id" => "ZEO0000047", "name" => "Manthai West Divisional Education Office", "short_name" => "Manthai West Division"),


            //Mullaitivu Zonal Education Office
            array("workplace_id" => "DEO0000145", "zeo_wp_id" => "ZEO0000049", "name" => "Maritime Pattu Divisional Education Office", "short_name" => "Maritime Pattu Division"),
            array("workplace_id" => "DEO0000146", "zeo_wp_id" => "ZEO0000049", "name" => "Puthukkudiyiruppu Divisional Education Office", "short_name" => "Puthukkudiyiruppu Division"),
            array("workplace_id" => "DEO0000150", "zeo_wp_id" => "ZEO0000049", "name" => "Welioya Divisional Education Office", "short_name" => "Welioya Division"),

            //Thunukkai Zonal Education Office
            array("workplace_id" => "DEO0000148", "zeo_wp_id" => "ZEO0000050", "name" => "Thunukkai Divisional Education Office", "short_name" => "Thunukkai Division"),
            array("workplace_id" => "DEO0000149", "zeo_wp_id" => "ZEO0000050", "name" => "Manthai East Divisional Education Office", "short_name" => "Manthai East Division"),
            array("workplace_id" => "DEO0000147", "zeo_wp_id" => "ZEO0000050", "name" => "Oddusuddan Divisional Education Office", "short_name" => "Oddusudan Division"),

            //Vavuniya South Zonal Education Office
            array("workplace_id" => "DEO0000155", "zeo_wp_id" => "ZEO0000051", "name" => "Vavniya South (Sinhala) Divisional Education Office", "short_name" => "Vavniya South (Sinhala) Division"),
            array("workplace_id" => "DEO0000151", "zeo_wp_id" => "ZEO0000051", "name" => "Vavniya South (Tamil) Divisional Education Office", "short_name" => "Vavniya South (Tamil) Division"),
            array("workplace_id" => "DEO0000154", "zeo_wp_id" => "ZEO0000051", "name" => "Vengalachettiulam Divisional Education Office", "short_name" => "Vengalachettiulam Division"),

            //Vavuniya North Zonal Education Office
            array("workplace_id" => "DEO0000153", "zeo_wp_id" => "ZEO0000052", "name" => "Nedunkerny Divisional Education Office", "short_name" => "Nedunkerny Division"),
            array("workplace_id" => "DEO0000152", "zeo_wp_id" => "ZEO0000052", "name" => "Omantai Divisional Education Office", "short_name" => "Omantai Division"),


            //Eastern
            //Kalkudah Zonal Education Office
            array("workplace_id" => "DEO0000156", "zeo_wp_id" => "ZEO0000053", "name" => "Koralai Pattu North Divisional Education Office", "short_name" => "Koralai Pattu North Division"),
            array("workplace_id" => "DEO0000158", "zeo_wp_id" => "ZEO0000053", "name" => "Koralai Pattu Divisional Education Office", "short_name" => "Koralai Pattu Division"),
            array("workplace_id" => "DEO0000159", "zeo_wp_id" => "ZEO0000053", "name" => "Eravur Pattu - II Divisional Education Office", "short_name" => "Eravur Pattu - II Division"),

            //Batticaloa Central Zonal Education Office
            array("workplace_id" => "DEO0000162", "zeo_wp_id" => "ZEO0000054", "name" => "Eravur Town Divisional Education Office", "short_name" => "Eravur Town Division"),
            array("workplace_id" => "DEO0000165", "zeo_wp_id" => "ZEO0000054", "name" => "Kaththankudy Divisional Education Office", "short_name" => "Kaththankudy Division"),
            array("workplace_id" => "DEO0000157", "zeo_wp_id" => "ZEO0000054", "name" => "Koralai Pattu West Divisional Education Office", "short_name" => "Koralai Pattu West Division"),


            //Batticaloa West Zonal Education Office
            array("workplace_id" => "DEO0000160", "zeo_wp_id" => "ZEO0000055", "name" => "Eravur Pattu - 111 Divisional Education Office", "short_name" => "Eravur Pattu - 111 Division"),
            array("workplace_id" => "DEO0000163", "zeo_wp_id" => "ZEO0000055", "name" => "Manmunai West Divisional Education Office", "short_name" => "Manmunai West Division"),
            array("workplace_id" => "DEO0000167", "zeo_wp_id" => "ZEO0000055", "name" => "Manmunai South West Divisional Education Office", "short_name" => "Manmunai South West Division"),


            //Batticaloa Zonal Education Office
            array("workplace_id" => "DEO0000164", "zeo_wp_id" => "ZEO0000056", "name" => "Manmunai - North (Batticaloa) Divisional Education Office", "short_name" => "Manmunai - North (Batticaloa) Division"),
            array("workplace_id" => "DEO0000161", "zeo_wp_id" => "ZEO0000056", "name" => "Eravur Pattu - 1 (Chenkalady) Divisional Education Office", "short_name" => "Eravur Pattu - 1 (Chenkalady) Division"),
            array("workplace_id" => "DEO0000166", "zeo_wp_id" => "ZEO0000056", "name" => "Manmunai Pattu Divisional Education Office", "short_name" => "Manmunai Pattu Division"),

            //Paddrippu Zonal Education Office
            array("workplace_id" => "DEO0000168", "zeo_wp_id" => "ZEO0000057", "name" => "Manmunai South & Eruvil paththu Department Of Education", "short_name" => "Manmunai South & Eruvil paththu"),
            array("workplace_id" => "DEO0000169", "zeo_wp_id" => "ZEO0000057", "name" => "Porativu Pattu Of Education Office", "short_name" => "Porativu Pattu Division"),


            //Mahaoya Zonal Education Office
            array("workplace_id" => "DEO0000170", "zeo_wp_id" => "ZEO0000058", "name" => "Mahaoya Divisional Education Office", "short_name" => "Mahaoya Division"),
            array("workplace_id" => "DEO0000171", "zeo_wp_id" => "ZEO0000058", "name" => "Padiyatalawa Divisional Education Office", "short_name" => "Padiyatalawa Division"),

            //Ampara Zonal Education Office
            array("workplace_id" => "DEO0000174", "zeo_wp_id" => "ZEO0000059", "name" => "Ampara Divisional Education Office", "short_name" => "Ampara Division"),
            array("workplace_id" => "DEO0000172", "zeo_wp_id" => "ZEO0000059", "name" => "Uhana Divisional Education Office", "short_name" => "Uhana Division"),
            array("workplace_id" => "DEO0000173", "zeo_wp_id" => "ZEO0000059", "name" => "Damana Divisional Education Office", "short_name" => "Damana Division"),
            array("workplace_id" => "DEO0000175", "zeo_wp_id" => "ZEO0000059", "name" => "Lahugala Divisional Education Office", "short_name" => "Lahugala Division"),

            //Dehiattakandiya Zonal Education Office
            array("workplace_id" => "DEO0000176", "zeo_wp_id" => "ZEO0000060", "name" => "Dehiattakandiya Divisional Education Office", "short_name" => "Dehiattakandiya Division"),

            //Dimbulagala Zonal Education Office
            array("workplace_id" => "DEO0000177", "zeo_wp_id" => "ZEO0000061", "name" => "Dimbulagala Divisional Education Office", "short_name" => "Dimbulagala Division"),
            array("workplace_id" => "DEO0000261", "zeo_wp_id" => "ZEO0000061", "name" => "Welikanda Divisional Education Office", "short_name" => "Welikanda Division"),
            array("workplace_id" => "DEO0000192", "zeo_wp_id" => "ZEO0000061", "name" => "Aralaganwila Divisional Education Office", "short_name" => "Aralaganwila Division"),

            //Sammanthurai Zonal Education Office
            array("workplace_id" => "DEO0000178", "zeo_wp_id" => "ZEO0000062", "name" => "Sammanthurai Divisional Education Office", "short_name" => "Sammanthurai Division"),
            array("workplace_id" => "DEO0000184", "zeo_wp_id" => "ZEO0000062", "name" => "Irakkamam Divisional Education Office", "short_name" => "Iragamam Division"),
            array("workplace_id" => "DEO0000179", "zeo_wp_id" => "ZEO0000062", "name" => "Navithanveli Divisional Education Office", "short_name" => "Navithanveli Division"),

            //Kalmunai Zonal Education Office
            array("workplace_id" => "DEO0000182", "zeo_wp_id" => "ZEO0000063", "name" => "Kalmunai Divisional Education Office", "short_name" => "Kalmunai Division"),
            array("workplace_id" => "DEO0000187", "zeo_wp_id" => "ZEO0000063", "name" => "Ninthavur Divisional Education Office", "short_name" => "Ninthavur Division"),
            array("workplace_id" => "DEO0000186", "zeo_wp_id" => "ZEO0000063", "name" => "Karaithivu Divisional Education Office", "short_name" => "Karaithivu Division"),
            array("workplace_id" => "DEO0000181", "zeo_wp_id" => "ZEO0000063", "name" => "Kalmunai Tamil Divisional Education Office", "short_name" => "Kalmunai Tamil Division"),
            array("workplace_id" => "DEO0000180", "zeo_wp_id" => "ZEO0000063", "name" => "Sainthamaruthu Divisional Education Office", "short_name" => "Sainthamaruthu Division"),

            //Akkaraipattu Zonal Education Office
            array("workplace_id" => "DEO0000183", "zeo_wp_id" => "ZEO0000064", "name" => "Akkaraipattu Divisional Education Office", "short_name" => "Akkaraipattu Division"),
            array("workplace_id" => "DEO0000185", "zeo_wp_id" => "ZEO0000064", "name" => "Addalachchenai Divisional Education Office", "short_name" => "Addalachchenai Division"),
            array("workplace_id" => "DEO0000190", "zeo_wp_id" => "ZEO0000064", "name" => "Potuvil-1 Divisional Education Office", "short_name" => "Potuvil-1 Division"),

            //Thirukkovil Zonal Education Office
            array("workplace_id" => "DEO0000189", "zeo_wp_id" => "ZEO0000065", "name" => "Tirukkovil Divisional Education Office", "short_name" => "Tirukkovil Division"),
            array("workplace_id" => "DEO0000188", "zeo_wp_id" => "ZEO0000065", "name" => "Alayadivembu Divisional Education Office", "short_name" => "Alayadivembu Division"),
            array("workplace_id" => "DEO0000191", "zeo_wp_id" => "ZEO0000065", "name" => "Potuvil-11 (Tamil) Divisional Education Office", "short_name" => "Potuvil-11 (Tamil) Division"),

            //Trincomalee North Zonal Education Office
            array("workplace_id" => "DEO0000195", "zeo_wp_id" => "ZEO0000066", "name" => "Gomarankadawala Divisional Education Office", "short_name" => "Gomarankadawala Division"),
            array("workplace_id" => "DEO0000196", "zeo_wp_id" => "ZEO0000066", "name" => "Morawewa Divisional Education Office", "short_name" => "Morawewa Division"),
            array("workplace_id" => "DEO0000193", "zeo_wp_id" => "ZEO0000066", "name" => "Padavi Sripura Divisional Education Office", "short_name" => "Padavi Sripura Division"),

            //Trincomalee Zonal Education Office
            array("workplace_id" => "DEO0000197", "zeo_wp_id" => "ZEO0000067", "name" => "Trincomalee Town Divisional Education Office", "short_name" => "Trincomalee Town Division"),
            array("workplace_id" => "DEO0000194", "zeo_wp_id" => "ZEO0000067", "name" => "Kuchchaveli Divisional Education Office", "short_name" => "Kuchchaveli Division"),
            array("workplace_id" => "DEO0000198", "zeo_wp_id" => "ZEO0000067", "name" => "Thampalakamam Divisional Education Office", "short_name" => "Thampalakamam Division"),

            //Kinniya Zonal Education Office
            array("workplace_id" => "DEO0000199", "zeo_wp_id" => "ZEO0000068", "name" => "Kinniya Divisional Education Office", "short_name" => "Kinniya Division"),
            array("workplace_id" => "DEO0000201", "zeo_wp_id" => "ZEO0000068", "name" => "Mullipothana Divisional Education Office", "short_name" => "Mullipothana Division"),
            array("workplace_id" => "DEO0000205", "zeo_wp_id" => "ZEO0000068", "name" => "Kurinchakerny Divisional Education Office", "short_name" => "Kurinchakerny Division"),

            //Kantale Zonal Education Office
            array("workplace_id" => "DEO0000200", "zeo_wp_id" => "ZEO0000069", "name" => "Kantale Divisional Education Office", "short_name" => "Kantalai Division"),
            array("workplace_id" => "DEO0000202", "zeo_wp_id" => "ZEO0000069", "name" => "Seruvila Divisional Education Office", "short_name" => "Seruwila Division"),

            //Muttur Zonal Education Office
            array("workplace_id" => "DEO0000203", "zeo_wp_id" => "ZEO0000070", "name" => "Muttur Divisional Education Office", "short_name" => "Mutur Division"),
            array("workplace_id" => "DEO0000204", "zeo_wp_id" => "ZEO0000070", "name" => "Eechchilampattu Divisional Education Office", "short_name" => "Eechchilampattu Division"),

            //Northwest
            //Kurunegala Zonal Education Office
            array("workplace_id" => "DEO0000213", "zeo_wp_id" => "ZEO0000071", "name" => "Kurunegala Divisional Education Office", "short_name" => "Kurunegala Division"),
            array("workplace_id" => "DEO0000206", "zeo_wp_id" => "ZEO0000071", "name" => "Polgahawela Divisional Education Office", "short_name" => "Polgahawela Division"),
            array("workplace_id" => "DEO0000208", "zeo_wp_id" => "ZEO0000071", "name" => "Mawathagama Divisional Education Office", "short_name" => "Mawathagama Division"),

            //Ibbagamuwa Zonal Education Office
            array("workplace_id" => "DEO0000210", "zeo_wp_id" => "ZEO0000072", "name" => "Ibbagamuwa Divisional Education Office", "short_name" => "Ibbagamuwa Division"),
            array("workplace_id" => "DEO0000207", "zeo_wp_id" => "ZEO0000072", "name" => "Rideegama Divisional Education Office", "short_name" => "Ridigama Division"),
            array("workplace_id" => "DEO0000211", "zeo_wp_id" => "ZEO0000072", "name" => "Ganewatta Divisional Education Office", "short_name" => "Ganewatta Division"),

            //Nikaweratiya Zonal Education Office
            array("workplace_id" => "DEO0000223", "zeo_wp_id" => "ZEO0000073", "name" => "Nikaweratiya Divisional Education Office", "short_name" => "Nikaweratiya Division"),
            array("workplace_id" => "DEO0000209", "zeo_wp_id" => "ZEO0000073", "name" => "Wariyapola Divisional Education Office", "short_name" => "Wariyapola Division"),
            array("workplace_id" => "DEO0000226", "zeo_wp_id" => "ZEO0000073", "name" => "Kobeigane Divisional Education Office", "short_name" => "Kobeigane Division"),
            array("workplace_id" => "DEO0000227", "zeo_wp_id" => "ZEO0000073", "name" => "Kotavehera Divisional Education Office", "short_name" => "Kotavehera Division"),

            //Giriulla Zonal Education Office
            array("workplace_id" => "DEO0000215", "zeo_wp_id" => "ZEO0000074", "name" => "Kuliyapitiya - East Divisional Education Office", "short_name" => "Kuliyapitiya - East Division"),
            array("workplace_id" => "DEO0000212", "zeo_wp_id" => "ZEO0000074", "name" => "Alawwa Divisional Education Office", "short_name" => "Alawwa Division"),
            array("workplace_id" => "DEO0000218", "zeo_wp_id" => "ZEO0000074", "name" => "Pannala Divisional Education Office", "short_name" => "Pannala Division"),

            //Kuliyapitiya Zonal Education Office
            array("workplace_id" => "DEO0000219", "zeo_wp_id" => "ZEO0000075", "name" => "Panduwasnuwara Divisional Education Office", "short_name" => "Panduwasnuwara Division"),
            array("workplace_id" => "DEO0000214", "zeo_wp_id" => "ZEO0000075", "name" => "Bingiriya Divisional Education Office", "short_name" => "Bingiriya Division"),
            array("workplace_id" => "DEO0000216", "zeo_wp_id" => "ZEO0000075", "name" => "Kuliyapitiya - West Divisional Education Office", "short_name" => "Kuliyapitiya - West Division"),
            array("workplace_id" => "DEO0000217", "zeo_wp_id" => "ZEO0000075", "name" => "Udubaddawa Divisional Education Office", "short_name" => "Udubaddawa Division"),
            array("workplace_id" => "DEO0000220", "zeo_wp_id" => "ZEO0000075", "name" => "Dahanakgedara Divisional Education Office", "short_name" => "Dahanakgedara Division"),


            //Maho Zonal Education Office
            array("workplace_id" => "DEO0000222", "zeo_wp_id" => "ZEO0000076", "name" => "Maho Divisional Education Office", "short_name" => "Maho Division"),
            array("workplace_id" => "DEO0000221", "zeo_wp_id" => "ZEO0000076", "name" => "Polpitigama Divisional Education Office", "short_name" => "Polpitigama Division"),
            array("workplace_id" => "DEO0000224", "zeo_wp_id" => "ZEO0000076", "name" => "Galgamuwa Divisional Education Office", "short_name" => "Galgamuwa Division"),
            array("workplace_id" => "DEO0000225", "zeo_wp_id" => "ZEO0000076", "name" => "Giribawa Divisional Education Office", "short_name" => "Giribawa Division"),

            //Chilaw Zonal Education Office
            array("workplace_id" => "DEO0000231", "zeo_wp_id" => "ZEO0000077", "name" => "Chilaw Divisional Education Office", "short_name" => "Chilaw Division"),
            array("workplace_id" => "DEO0000232", "zeo_wp_id" => "ZEO0000077", "name" => "Arachchikattuwa Divisional Education Office", "short_name" => "Arachchikattuwa Division"),
            array("workplace_id" => "DEO0000234", "zeo_wp_id" => "ZEO0000077", "name" => "Nattandiya Divisional Education Office", "short_name" => "Nattandiya Division"),
            array("workplace_id" => "DEO0000233", "zeo_wp_id" => "ZEO0000077", "name" => "Wennappuwa Divisional Education Office", "short_name" => "Wennappuwa Division"),

            //Puttalam Zonal Education Office
            array("workplace_id" => "DEO0000144", "zeo_wp_id" => "ZEO0000048", "name" => "Puttalam North Divisional Education Office", "short_name" => "Puttalam North Division"),
            array("workplace_id" => "DEO0000230", "zeo_wp_id" => "ZEO0000048", "name" => "Puttalam South Divisional Education Office", "short_name" => "Puttalam South Division"),
            array("workplace_id" => "DEO0000228", "zeo_wp_id" => "ZEO0000048", "name" => "Anamaduwa Divisional Education Office", "short_name" => "Anamaduwa Division"),
            array("workplace_id" => "DEO0000143", "zeo_wp_id" => "ZEO0000048", "name" => "Kalpitiya Divisional Education Office", "short_name" => "Kalpitiya Division"),
            array("workplace_id" => "DEO0000229", "zeo_wp_id" => "ZEO0000048", "name" => "Pallama Divisional Education Office", "short_name" => "Pallama Division"),


            //North Central
            //Kebithigollewa Zonal Education Office
            array("workplace_id" => "DEO0000237", "zeo_wp_id" => "ZEO0000078", "name" => "Kebithigollewa Divisional Education Office", "short_name" => "Kebithigollewa Division"),
            array("workplace_id" => "DEO0000238", "zeo_wp_id" => "ZEO0000078", "name" => "Padaviya Divisional Education Office", "short_name" => "Padaviya Division"),
            array("workplace_id" => "DEO0000239", "zeo_wp_id" => "ZEO0000078", "name" => "Horowpathana Divisional Education Office", "short_name" => "Horowpathana Division"),
            array("workplace_id" => "DEO0000235", "zeo_wp_id" => "ZEO0000078", "name" => "Medawachchiya Divisional Education Office", "short_name" => "Medawachchiya Division"),

            //Anuradhapura Zonal Education Office
            array("workplace_id" => "DEO0000242", "zeo_wp_id" => "ZEO0000079", "name" => "Nuwaragam Palatha(East) Divisional Education Office", "short_name" => "Nuwaragam Palatha(East) Division"),
            array("workplace_id" => "DEO0000246", "zeo_wp_id" => "ZEO0000079", "name" => "Nuwaragam Palatha(Central) Divisional Education Office", "short_name" => "Nuwaragam Palatha(Central) Division"),
            array("workplace_id" => "DEO0000236", "zeo_wp_id" => "ZEO0000079", "name" => "Rambewa Divisional Education Office", "short_name" => "Rambewa Division"),
            array("workplace_id" => "DEO0000248", "zeo_wp_id" => "ZEO0000079", "name" => "Nochchiiyagama Divisional Education Office", "short_name" => "Nochchiiyagama Division"),
            array("workplace_id" => "DEO0000247", "zeo_wp_id" => "ZEO0000079", "name" => "Mahawilachchiya Divisional Education Office", "short_name" => "Mahawilachchiya Division"),
            array("workplace_id" => "DEO0000243", "zeo_wp_id" => "ZEO0000079", "name" => "Nachchaduwa Divisional Education Office", "short_name" => "Nachchaduwa Division"),

            //Galenbindunuwewa Zonal Education Office
            array("workplace_id" => "DEO0000241", "zeo_wp_id" => "ZEO0000080", "name" => "Galenbindunuwewa Divisional Education Office", "short_name" => "Galenbindunuwewa Division"),
            array("workplace_id" => "DEO0000240", "zeo_wp_id" => "ZEO0000080", "name" => "Kahatagasdigiliya Divisional Education Office", "short_name" => "Kahatagasdigiliya Division"),
            array("workplace_id" => "DEO0000245", "zeo_wp_id" => "ZEO0000080", "name" => "Mihintale Divisional Education Office", "short_name" => "Mihintale Division"),


            //Thambuttegama Zonal Education Office
            array("workplace_id" => "DEO0000249", "zeo_wp_id" => "ZEO0000081", "name" => "Tambuttegama Divisional Education Office", "short_name" => "Tambuttegama Division"),
            array("workplace_id" => "DEO0000244", "zeo_wp_id" => "ZEO0000081", "name" => "Talawa Divisional Education Office", "short_name" => "Talawa Division"),
            array("workplace_id" => "DEO0000250", "zeo_wp_id" => "ZEO0000081", "name" => "Rajanganaya Divisional Education Office", "short_name" => "Rajanganaya Division"),
            array("workplace_id" => "DEO0000252", "zeo_wp_id" => "ZEO0000081", "name" => "Galnewa Divisional Education Office", "short_name" => "Galnewa Division"),

            //Kekirawa Zonal Education Office
            array("workplace_id" => "DEO0000253", "zeo_wp_id" => "ZEO0000082", "name" => "Kekirawa Divisional Education Office", "short_name" => "Kekirawa Division"),
            array("workplace_id" => "DEO0000256", "zeo_wp_id" => "ZEO0000082", "name" => "Palugaswewa Divisional Education Office", "short_name" => "Palugaswewa Division"),
            array("workplace_id" => "DEO0000255", "zeo_wp_id" => "ZEO0000082", "name" => "Palagala Divisional Education Office", "short_name" => "Palagala Division"),
            array("workplace_id" => "DEO0000254", "zeo_wp_id" => "ZEO0000082", "name" => "Thirappane Divisional Education Office", "short_name" => "Thirappane Division"),
            array("workplace_id" => "DEO0000251", "zeo_wp_id" => "ZEO0000082", "name" => "Ipalogama Divisional Education Office", "short_name" => "Ipalogama Division"),


            //Hingurakgoda Zonal Education Office
            array("workplace_id" => "DEO0000257", "zeo_wp_id" => "ZEO0000083", "name" => "Hingurakgoda Divisional Education Office", "short_name" => "Hingurakgoda Division"),
            array("workplace_id" => "DEO0000258", "zeo_wp_id" => "ZEO0000083", "name" => "Medirigiriya Divisional Education Office", "short_name" => "Medirigiriya Division"),
            array("workplace_id" => "DEO0000262", "zeo_wp_id" => "ZEO0000083", "name" => "Elahera Divisional Education Office", "short_name" => "Elahera Division"),

            //Polonnaruwa Zonal Education Office
            array("workplace_id" => "DEO0000260", "zeo_wp_id" => "ZEO0000084", "name" => "Tamankaduwa Divisional Education Office", "short_name" => "Tamankaduwa Division"),
            array("workplace_id" => "DEO0000259", "zeo_wp_id" => "ZEO0000084", "name" => "Lankapura Divisional Education Office", "short_name" => "Lankapura Division"),

            //Uva
            //Mahiyanganaya Zonal Education Office
            array("workplace_id" => "DEO0000264", "zeo_wp_id" => "ZEO0000085", "name" => "Mahiyanganaya Divisional Education Office", "short_name" => "Mahiyanganaya Division"),
            array("workplace_id" => "DEO0000263", "zeo_wp_id" => "ZEO0000085", "name" => "Rideemaliyedda Divisional Education Office", "short_name" => "Rideemaliyedda Division"),

            //Viyaluwa Zonal Education Office
            array("workplace_id" => "DEO0000265", "zeo_wp_id" => "ZEO0000086", "name" => "Soranatota Divisional Education Office", "short_name" => "Soranatota Division"),
            array("workplace_id" => "DEO0000267", "zeo_wp_id" => "ZEO0000086", "name" => "Meegahakivula Divisional Education Office", "short_name" => "Meegahakivula Division"),
            array("workplace_id" => "DEO0000266", "zeo_wp_id" => "ZEO0000086", "name" => "Kandeketiya Divisional Education Office", "short_name" => "Kandeketiya Division"),

            //Passara Zonal Education Office
            array("workplace_id" => "DEO0000268", "zeo_wp_id" => "ZEO0000087", "name" => "Passara Divisional Education Office", "short_name" => "Passara Division"),

            //Badulla Zonal Education Office
            array("workplace_id" => "DEO0000269", "zeo_wp_id" => "ZEO0000088", "name" => "Badulla Divisional Education Office", "short_name" => "Badulla Division"),
            array("workplace_id" => "DEO0000270", "zeo_wp_id" => "ZEO0000088", "name" => "Haliela Divisional Education Office", "short_name" => "Haliela Division"),

            //Bandarawela Zonal Education Office
            array("workplace_id" => "DEO0000271", "zeo_wp_id" => "ZEO0000089", "name" => "Bandarawela Divisional Education Office", "short_name" => "Bandarawela Division"),
            array("workplace_id" => "DEO0000273", "zeo_wp_id" => "ZEO0000089", "name" => "Haldummulla Divisional Education Office", "short_name" => "Haldummulla Division"),
            array("workplace_id" => "DEO0000274", "zeo_wp_id" => "ZEO0000089", "name" => "Haputale Divisional Education Office", "short_name" => "Haputale Division"),
            array("workplace_id" => "DEO0000272", "zeo_wp_id" => "ZEO0000089", "name" => "Ella Divisional Education Office", "short_name" => "Ella Division"),


            //Welimada Zonal Education Office
            array("workplace_id" => "DEO0000275", "zeo_wp_id" => "ZEO0000090", "name" => "Welimada Divisional Education Office", "short_name" => "Welimada Division"),
            array("workplace_id" => "DEO0000276", "zeo_wp_id" => "ZEO0000090", "name" => "Uva-Paranagama Divisional Education Office", "short_name" => "Uva-Paranagama Division"),

            //Bibile Zonal Education Office
            array("workplace_id" => "DEO0000277", "zeo_wp_id" => "ZEO0000091", "name" => "Bibile Divisional Education Office", "short_name" => "Bibile Division"),
            array("workplace_id" => "DEO0000279", "zeo_wp_id" => "ZEO0000091", "name" => "Madulla Divisional Education Office", "short_name" => "Madulla Division"),
            array("workplace_id" => "DEO0000278", "zeo_wp_id" => "ZEO0000091", "name" => "Medagama Divisional Education Office", "short_name" => "Medagama Division"),

            //Moneragala Zonal Education Office
            array("workplace_id" => "DEO0000281", "zeo_wp_id" => "ZEO0000092", "name" => "Siyambalanduwa Divisional Education Office", "short_name" => "Siyambalanduwa Division"),
            array("workplace_id" => "DEO0000280", "zeo_wp_id" => "ZEO0000092", "name" => "Monaragala Divisional Education Office", "short_name" => "Monaragala Division"),
            array("workplace_id" => "DEO0000282", "zeo_wp_id" => "ZEO0000092", "name" => "Badalkumbura Divisional Education Office", "short_name" => "Badalkumbura Division"),

            //Wellawaya Zonal Education Office
            array("workplace_id" => "DEO0000283", "zeo_wp_id" => "ZEO0000093", "name" => "Wellawaya Divisional Education Office", "short_name" => "Wellawaya Division"),
            array("workplace_id" => "DEO0000284", "zeo_wp_id" => "ZEO0000093", "name" => "Buttala Divisional Education Office", "short_name" => "Buttala Division"),

            //Thanamalwila Zonal Education Office
            array("workplace_id" => "DEO0000118", "zeo_wp_id" => "ZEO0000038", "name" => "Tanamalwila Divisional Education Office", "short_name" => "Tanamalwila Division"),


            //Sabaragamuwa
            //Ratnapura Zonal Education Office
            array("workplace_id" => "DEO0000287", "zeo_wp_id" => "ZEO0000094", "name" => "Ratnapura Divisional Education Office", "short_name" => "Ratnapura Division"),
            array("workplace_id" => "DEO0000288", "zeo_wp_id" => "ZEO0000094", "name" => "Sri Pada Divisional Education Office", "short_name" => "Ratnapura 2 Division"),
            array("workplace_id" => "DEO0000289", "zeo_wp_id" => "ZEO0000094", "name" => "Pelmadulla Divisional Education Office", "short_name" => "Pelmadulla Division"),
            array("workplace_id" => "DEO0000285", "zeo_wp_id" => "ZEO0000094", "name" => "Eheliyagoda Divisional Education Office", "short_name" => "Eheliyagoda Division"),
            array("workplace_id" => "DEO0000286", "zeo_wp_id" => "ZEO0000094", "name" => "Kuruwita Divisional Education Office", "short_name" => "Kuruwita Division"),


            //Balangoda Zonal Education Office
            array("workplace_id" => "DEO0000290", "zeo_wp_id" => "ZEO0000095", "name" => "Balangoda Divisional Education Office", "short_name" => "Balangoda Division"),
            array("workplace_id" => "DEO0000291", "zeo_wp_id" => "ZEO0000095", "name" => "Imbulpe Divisional Education Office", "short_name" => "Imbulpe Division"),
            array("workplace_id" => "DEO0000293", "zeo_wp_id" => "ZEO0000095", "name" => "Weligepola Divisional Education Office", "short_name" => "Weligepola Division"),

            //Embilipitiya Zonal Education Office
            array("workplace_id" => "DEO0000300", "zeo_wp_id" => "ZEO0000096", "name" => "Embilipitiya Divisional Education Office", "short_name" => "Embilipitiya Division"),
            array("workplace_id" => "DEO0000299", "zeo_wp_id" => "ZEO0000096", "name" => "Kolonne Divisional Education Office", "short_name" => "Kolonne Division"),
            array("workplace_id" => "DEO0000292", "zeo_wp_id" => "ZEO0000096", "name" => "Godakawela Divisional Education Office", "short_name" => "Godakawela Division"),


            //Nivitigala Zonal Education Office
            array("workplace_id" => "DEO0000294", "zeo_wp_id" => "ZEO0000097", "name" => "Nivitigala Divisional Education Office", "short_name" => "Nivitigala Division"),
            array("workplace_id" => "DEO0000298", "zeo_wp_id" => "ZEO0000097", "name" => "Ayagama Divisional Education Office", "short_name" => "Ayagama Division"),
            array("workplace_id" => "DEO0000297", "zeo_wp_id" => "ZEO0000097", "name" => "Kalawana Divisional Education Office", "short_name" => "Kalawana Division"),
            array("workplace_id" => "DEO0000295", "zeo_wp_id" => "ZEO0000097", "name" => "Kahawatta Divisional Education Office", "short_name" => "Kahawatta Division"),
            array("workplace_id" => "DEO0000296", "zeo_wp_id" => "ZEO0000097", "name" => "Elapatha Divisional Education Office", "short_name" => "Elapatha Division"),

            //Dehiowita Zonal Education Office
            array("workplace_id" => "DEO0000304", "zeo_wp_id" => "ZEO0000098", "name" => "Dehiowita Divisional Education Office", "short_name" => "Dehiowita Division"),
            array("workplace_id" => "DEO0000307", "zeo_wp_id" => "ZEO0000098", "name" => "Ruwanwella Divisional Education Office", "short_name" => "Ruwanwella Division"),
            array("workplace_id" => "DEO0000302", "zeo_wp_id" => "ZEO0000098", "name" => "Deraniyagala Divisional Education Office", "short_name" => "Deraniyagala Division"),
            array("workplace_id" => "DEO0000303", "zeo_wp_id" => "ZEO0000098", "name" => "Yatiyantota Divisional Education Office", "short_name" => "Yatiyantota Division"),
            array("workplace_id" => "DEO0000301", "zeo_wp_id" => "ZEO0000098", "name" => "Kitulgala Divisional Education Office", "short_name" => "Kitulgala Division"),

            //Kegalle Zonal Education Office
            array("workplace_id" => "DEO0000312", "zeo_wp_id" => "ZEO0000099", "name" => "Kegalle Divisional Education Office", "short_name" => "Kegalle Division"),
            array("workplace_id" => "DEO0000305", "zeo_wp_id" => "ZEO0000099", "name" => "Galigamuwa Divisional Education Office", "short_name" => "Galigamuwa Division"),
            array("workplace_id" => "DEO0000308", "zeo_wp_id" => "ZEO0000099", "name" => "Warakapola Divisional Education Office", "short_name" => "Warakapola Division"),
            array("workplace_id" => "DEO0000306", "zeo_wp_id" => "ZEO0000099", "name" => "Dedigama Divisional Education Office", "short_name" => "Dedigama Division"),

            //Mawanella Zonal Education Office
            array("workplace_id" => "DEO0000310", "zeo_wp_id" => "ZEO0000100", "name" => "Mawanella Divisional Education Office", "short_name" => "Mawanella Division"),
            array("workplace_id" => "DEO0000309", "zeo_wp_id" => "ZEO0000100", "name" => "Rambukkana Divisional Education Office", "short_name" => "Rambukkana Division"),
            array("workplace_id" => "DEO0000311", "zeo_wp_id" => "ZEO0000100", "name" => "Aranayaka Divisional Education Office", "short_name" => "Aranayaka Division"),
        ];

        foreach ($divisionalOffices as $office) {
            DB::table('divisional_education_offices')->updateOrInsert(
                ['workplace_id' => $office['workplace_id']],
                [
                    'zeo_wp_id' => $office['zeo_wp_id'],
                    'name' => $office['name'],
                    'short_name' => $office['short_name'],
                    'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                    'updated_at' => Carbon::now()->format('Y-m-d H:i:s'),
                ]
            );
        }
    }
}
