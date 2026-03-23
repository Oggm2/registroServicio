-- --
-- -- PostgreSQL database dump
-- --

-- \restrict XH8uvXm2wVvrrmZ5yhqxeKAuCKvGsv9w81JKc2wXa4CW0DyAoPuisviSL4X4ihS

-- -- Dumped from database version 18.2
-- -- Dumped by pg_dump version 18.2

-- -- Started on 2026-03-22 19:22:39

-- SET statement_timeout = 0;
-- SET lock_timeout = 0;
-- SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
-- SET client_encoding = 'UTF8';
-- SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
-- SET check_function_bodies = false;
-- SET xmloption = content;
-- SET client_min_messages = warning;
-- SET row_security = off;

-- SET default_tablespace = '';

-- SET default_table_access_method = heap;

-- --
-- -- TOC entry 225 (class 1259 OID 16499)
-- -- Name: asistencias_feria; Type: TABLE; Schema: public; Owner: postgres
-- --

-- CREATE TABLE public.asistencias_feria (
--     id integer NOT NULL,
--     estudiante_id integer NOT NULL,
--     evento_feria_id integer,
--     fecha_asistencia date CONSTRAINT asistencias_feria_hora_asistencia_not_null NOT NULL,
--     estatus_asistencia character varying(20) NOT NULL,
--     horario_seleccionado character varying(50) DEFAULT 'Sin definir'::character varying NOT NULL,
--     hora_real_asistencia time without time zone,
--     periodo character varying(30),
--     hora_salida timestamp without time zone,
--     servicio_id integer
-- );


-- ALTER TABLE public.asistencias_feria OWNER TO postgres;

-- --
-- -- TOC entry 231 (class 1259 OID 16555)
-- -- Name: asistencias_feria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
-- --

-- ALTER TABLE public.asistencias_feria ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
--     SEQUENCE NAME public.asistencias_feria_id_seq
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1
-- );


-- --
-- -- TOC entry 220 (class 1259 OID 16430)
-- -- Name: carreras; Type: TABLE; Schema: public; Owner: postgres
-- --

-- CREATE TABLE public.carreras (
--     id integer NOT NULL,
--     nombre character varying(100) NOT NULL,
--     abreviatura character varying(10) NOT NULL
-- );


-- ALTER TABLE public.carreras OWNER TO postgres;

-- --
-- -- TOC entry 227 (class 1259 OID 16551)
-- -- Name: carreras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
-- --

-- ALTER TABLE public.carreras ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
--     SEQUENCE NAME public.carreras_id_seq
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1
-- );


-- --
-- -- TOC entry 221 (class 1259 OID 16442)
-- -- Name: estudiantes; Type: TABLE; Schema: public; Owner: postgres
-- --

-- CREATE TABLE public.estudiantes (
--     id integer NOT NULL,
--     usuario_id integer NOT NULL,
--     nombre_completo character varying(150) NOT NULL,
--     matricula character varying(20) NOT NULL,
--     carrera_id integer NOT NULL,
--     celular character varying(15) NOT NULL,
--     correo_alterno character varying(150) NOT NULL
-- );


-- ALTER TABLE public.estudiantes OWNER TO postgres;

-- --
-- -- TOC entry 228 (class 1259 OID 16552)
-- -- Name: estudiantes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
-- --

-- ALTER TABLE public.estudiantes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
--     SEQUENCE NAME public.estudiantes_id_seq
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1
-- );


-- --
-- -- TOC entry 222 (class 1259 OID 16460)
-- -- Name: eventos_feria; Type: TABLE; Schema: public; Owner: postgres
-- --

-- CREATE TABLE public.eventos_feria (
--     id integer NOT NULL,
--     nombre character varying(150) NOT NULL,
--     descripcion text NOT NULL,
--     fecha_evento date NOT NULL,
--     hora_inicio time without time zone NOT NULL,
--     hora_fin time without time zone NOT NULL,
--     ubicacion character varying(200) NOT NULL,
--     estatus character varying(20) NOT NULL
-- );


-- ALTER TABLE public.eventos_feria OWNER TO postgres;

-- --
-- -- TOC entry 236 (class 1259 OID 16631)
-- -- Name: eventos_feria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
-- --

-- ALTER TABLE public.eventos_feria ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
--     SEQUENCE NAME public.eventos_feria_id_seq
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1
-- );


-- --
-- -- TOC entry 235 (class 1259 OID 16573)
-- -- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
-- --

-- CREATE TABLE public.password_reset_tokens (
--     id integer NOT NULL,
--     usuario_id integer NOT NULL,
--     token character varying(128) NOT NULL,
--     expires_at timestamp without time zone NOT NULL,
--     used boolean DEFAULT false
-- );


-- ALTER TABLE public.password_reset_tokens OWNER TO postgres;

-- --
-- -- TOC entry 234 (class 1259 OID 16572)
-- -- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
-- --

-- CREATE SEQUENCE public.password_reset_tokens_id_seq
--     AS integer
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1;


-- ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

-- --
-- -- TOC entry 5119 (class 0 OID 0)
-- -- Dependencies: 234
-- -- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
-- --

-- ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


-- --
-- -- TOC entry 224 (class 1259 OID 16490)
-- -- Name: preregistros; Type: TABLE; Schema: public; Owner: postgres
-- --

-- CREATE TABLE public.preregistros (
--     id integer NOT NULL,
--     estudiante_id integer NOT NULL,
--     servicio_id integer NOT NULL,
--     fecha_registro timestamp without time zone NOT NULL
-- );


-- ALTER TABLE public.preregistros OWNER TO postgres;

-- --
-- -- TOC entry 230 (class 1259 OID 16554)
-- -- Name: preregistros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
-- --

-- ALTER TABLE public.preregistros ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
--     SEQUENCE NAME public.preregistros_id_seq
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1
-- );


-- --
-- -- TOC entry 223 (class 1259 OID 16475)
-- -- Name: servicios; Type: TABLE; Schema: public; Owner: postgres
-- --

-- CREATE TABLE public.servicios (
--     id integer NOT NULL,
--     descripcion text NOT NULL,
--     crn character varying(20) CONSTRAINT "servicios_CRN_not_null" NOT NULL,
--     periodo character varying(20) NOT NULL,
--     cupo_maximo integer NOT NULL,
--     evento_feria_id integer,
--     socio_formador_id integer NOT NULL
-- );


-- ALTER TABLE public.servicios OWNER TO postgres;

-- --
-- -- TOC entry 229 (class 1259 OID 16553)
-- -- Name: servicios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
-- --

-- ALTER TABLE public.servicios ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
--     SEQUENCE NAME public.servicios_id_seq
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1
-- );


-- --
-- -- TOC entry 233 (class 1259 OID 16557)
-- -- Name: socios_formadores; Type: TABLE; Schema: public; Owner: postgres
-- --

-- CREATE TABLE public.socios_formadores (
--     id integer NOT NULL,
--     nombre character varying(200) NOT NULL
-- );


-- ALTER TABLE public.socios_formadores OWNER TO postgres;

-- --
-- -- TOC entry 232 (class 1259 OID 16556)
-- -- Name: socios_formadores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
-- --

-- CREATE SEQUENCE public.socios_formadores_id_seq
--     AS integer
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1;


-- ALTER SEQUENCE public.socios_formadores_id_seq OWNER TO postgres;

-- --
-- -- TOC entry 5120 (class 0 OID 0)
-- -- Dependencies: 232
-- -- Name: socios_formadores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
-- --

-- ALTER SEQUENCE public.socios_formadores_id_seq OWNED BY public.socios_formadores.id;


-- --
-- -- TOC entry 219 (class 1259 OID 16419)
-- -- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
-- --

-- CREATE TABLE public.usuarios (
--     id integer NOT NULL,
--     username character varying(50) NOT NULL,
--     password_hash character varying(255) NOT NULL,
--     rol character varying(20) NOT NULL,
--     CONSTRAINT chk_rol CHECK (((rol)::text = ANY ((ARRAY['Estudiante'::character varying, 'Admin'::character varying, 'Becario'::character varying])::text[])))
-- );


-- ALTER TABLE public.usuarios OWNER TO postgres;

-- --
-- -- TOC entry 226 (class 1259 OID 16550)
-- -- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
-- --

-- ALTER TABLE public.usuarios ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
--     SEQUENCE NAME public.usuarios_id_seq
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1
-- );


-- --
-- -- TOC entry 4898 (class 2604 OID 16576)
-- -- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


-- --
-- -- TOC entry 4897 (class 2604 OID 16560)
-- -- Name: socios_formadores id; Type: DEFAULT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.socios_formadores ALTER COLUMN id SET DEFAULT nextval('public.socios_formadores_id_seq'::regclass);


-- --
-- -- TOC entry 5102 (class 0 OID 16499)
-- -- Dependencies: 225
-- -- Data for Name: asistencias_feria; Type: TABLE DATA; Schema: public; Owner: postgres
-- --

-- COPY public.asistencias_feria (id, estudiante_id, evento_feria_id, fecha_asistencia, estatus_asistencia, horario_seleccionado, hora_real_asistencia, periodo, hora_salida, servicio_id) FROM stdin;
-- 2	2	1	2026-02-17	presente	Sin definir	\N	\N	\N	\N
-- 3	3	1	2026-02-17	ausente	Sin definir	\N	\N	\N	\N
-- 1	1	1	2026-02-17	asistió	Sin definir	\N	\N	\N	\N
-- 7	4	\N	2026-02-18	dentro	12:00 - 13:00	18:22:07.128727	\N	\N	\N
-- 9	6	\N	2026-03-02	pendiente	11:00 - 12:00	\N	\N	\N	\N
-- 8	5	\N	2026-02-18	dentro	14:00 - 15:00	15:43:39.226143	\N	2026-03-09 15:43:35.196116	\N
-- 10	9	\N	2026-03-09	pendiente	11:00 - 12:00	\N	\N	\N	\N
-- 11	10	\N	2026-03-09	dentro	11:00 - 12:00	15:55:52.544992	\N	\N	\N
-- 12	11	\N	2026-03-09	dentro	09:00 - 10:00	16:10:50.859215	\N	\N	\N
-- \.


-- --
-- -- TOC entry 5097 (class 0 OID 16430)
-- -- Dependencies: 220
-- -- Data for Name: carreras; Type: TABLE DATA; Schema: public; Owner: postgres
-- --

-- COPY public.carreras (id, nombre, abreviatura) FROM stdin;
-- 1	Ingeniería en Sistemas	IS
-- 2	Administración de Empresas	LAE
-- 3	Contaduría Pública	CP
-- \.


-- --
-- -- TOC entry 5098 (class 0 OID 16442)
-- -- Dependencies: 221
-- -- Data for Name: estudiantes; Type: TABLE DATA; Schema: public; Owner: postgres
-- --

-- COPY public.estudiantes (id, usuario_id, nombre_completo, matricula, carrera_id, celular, correo_alterno) FROM stdin;
-- 1	3	Juan Pérez García	A001	1	5511111111	juan.alt@gmail.com
-- 2	4	María López Torres	A002	2	5522222222	maria.alt@gmail.com
-- 3	5	Carlos Ramírez Díaz	A003	3	5533333333	carlos.alt@gmail.com
-- 4	6	Ofellia Gabriela Gongora Mendez	A01666131	1	5514747311	ofelia.gabriela.gongara@gmail.com
-- 5	8	Cesar Isao Patelin Kohagura	a01659947	2	5574877698	isao.pastelin@gmail.com
-- 6	9	Sibyla Vera Avila	a01112223	2	5522702914	sivera@gmail.com
-- 7	10	Gabriela Gongora	a01666131	2	5514747311	ofe@gmail.com
-- 8	11	Regina Perez	a12345678	3	5514235676	re@gmail.com
-- 9	12	Juan Perez Lopez	A12345678	3	5514756545	juanito@gmail.com
-- 10	13	Regina Perez	A01659356	1	5564738273	regina@gmail.com
-- 11	14	Regina Pérez Vázquez	A01659357	2	5535104331	reginap@gmail.com
-- \.


-- --
-- -- TOC entry 5099 (class 0 OID 16460)
-- -- Dependencies: 222
-- -- Data for Name: eventos_feria; Type: TABLE DATA; Schema: public; Owner: postgres
-- --

-- COPY public.eventos_feria (id, nombre, descripcion, fecha_evento, hora_inicio, hora_fin, ubicacion, estatus) FROM stdin;
-- 1	Feria Laboral 2026	Evento principal de reclutamiento	2026-03-15	09:00:00	15:00:00	Auditorio A	activo
-- 2	Feria Laboral 2025	Evento pasado	2025-03-10	09:00:00	14:00:00	Auditorio B	cerrado
-- \.


-- --
-- -- TOC entry 5112 (class 0 OID 16573)
-- -- Dependencies: 235
-- -- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
-- --

-- COPY public.password_reset_tokens (id, usuario_id, token, expires_at, used) FROM stdin;
-- 1	3	token_valido_123	2026-02-17 19:35:32.581394	f
-- 2	4	token_expirado_456	2026-02-17 17:35:32.581394	f
-- 3	5	token_usado_789	2026-02-17 19:35:32.581394	t
-- \.


-- --
-- -- TOC entry 5101 (class 0 OID 16490)
-- -- Dependencies: 224
-- -- Data for Name: preregistros; Type: TABLE DATA; Schema: public; Owner: postgres
-- --

-- COPY public.preregistros (id, estudiante_id, servicio_id, fecha_registro) FROM stdin;
-- 1	1	1	2026-02-17 18:35:32.581394
-- 2	2	1	2026-02-17 18:35:32.581394
-- 3	3	2	2026-02-17 18:35:32.581394
-- 4	3	3	2026-02-18 02:24:17.071751
-- 5	1	3	2026-02-18 02:25:52.655753
-- 6	4	2	2026-02-18 18:43:51.373715
-- 7	5	1	2026-02-18 23:11:37.634983
-- 8	4	12	2026-02-19 00:24:05.87869
-- 9	5	13	2026-03-04 23:04:28.076761
-- 10	10	3	2026-03-09 21:56:19.96113
-- 11	11	13	2026-03-09 22:15:26.070605
-- \.


-- --
-- -- TOC entry 5100 (class 0 OID 16475)
-- -- Dependencies: 223
-- -- Data for Name: servicios; Type: TABLE DATA; Schema: public; Owner: postgres
-- --

-- COPY public.servicios (id, descripcion, crn, periodo, cupo_maximo, evento_feria_id, socio_formador_id) FROM stdin;
-- 2	Revisión de CV	CRN002	2026-1	5	1	2
-- 3	Plática informativa	CRN003	2026-1	3	1	3
-- 1	Entrevistas técnicas	CRN001	2026-1	3	1	1
-- 12	PRUEBA	2u3ine12313	2025-01	33	\N	10
-- 13	bla bla	00056	invierno-2027	23	\N	10
-- \.


-- --
-- -- TOC entry 5110 (class 0 OID 16557)
-- -- Dependencies: 233
-- -- Data for Name: socios_formadores; Type: TABLE DATA; Schema: public; Owner: postgres
-- --

-- COPY public.socios_formadores (id, nombre) FROM stdin;
-- 1	Google México
-- 2	BBVA
-- 3	Amazon
-- 4	Microsoft
-- 5	AMPRE
-- 6	Escuela Somalia
-- 7	Santander
-- 8	Nu
-- 9	Didi
-- 10	Stori
-- 11	BanBajio
-- 12	Banco Azteca
-- 13	Scotiabank
-- 14	Uber
-- 15	Sushiito
-- 16	Samsung
-- 17	Apple
-- 18	ASUS
-- 19	Logitec
-- 20	Tecmilenio
-- \.


-- --
-- -- TOC entry 5096 (class 0 OID 16419)
-- -- Dependencies: 219
-- -- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
-- --

-- COPY public.usuarios (id, username, password_hash, rol) FROM stdin;
-- 1	admin1	$2b$12$/Mx3t0Vv.RJoY.JU/WgmBORcuU.oQVJ09Lf3/t9NlEpl4S7sdaWBu	Admin
-- 2	becario1	$2b$12$/Mx3t0Vv.RJoY.JU/WgmBORcuU.oQVJ09Lf3/t9NlEpl4S7sdaWBu	Becario
-- 3	estudiante1	$2b$12$/Mx3t0Vv.RJoY.JU/WgmBORcuU.oQVJ09Lf3/t9NlEpl4S7sdaWBu	Estudiante
-- 4	estudiante2	$2b$12$/Mx3t0Vv.RJoY.JU/WgmBORcuU.oQVJ09Lf3/t9NlEpl4S7sdaWBu	Estudiante
-- 5	estudiante3	$2b$12$/Mx3t0Vv.RJoY.JU/WgmBORcuU.oQVJ09Lf3/t9NlEpl4S7sdaWBu	Estudiante
-- 6	Ofelia Gongora	$2b$12$ZYAP4vCN.hFNM1oP9z/BIunvaPM78e8/7aAl58bGCDgORiBP49Ypm	Estudiante
-- 7	becario02	$2b$12$FGGDam3qFauVfZC/WXYNZeb5jH5G.TkI4mEuYHfT06utJpr9Xt9RO	Becario
-- 8	isao123	$2b$12$qkn/NbHnXPcsM/dkTVBHpOMv36oS4ex0EVO3rkFHcruOAVUse0a5y	Estudiante
-- 9	SibyVera	$2b$12$HZDV4fi1eGaLSqTHEW/ojO7OZqtGXXOXQES2WzQYUQOdKe4S4un56	Estudiante
-- 10	fjfdd	$2b$12$NyXnyxFvdI/RxssEN1NYp.2u5NuDQB5YY/Tua5.mtXg14kejt2dqe	Estudiante
-- 11	RePerez	$2b$12$6qpiYt2gGaM9/0FUvZ8YNe.HcTArZ2R2yyad/noh8/C5nMHATrWuS	Estudiante
-- 12	Juanito	$2b$12$s0OVWcwMnkFIiYQGQdD5v.8hfVv094BThLx2ZtWDaRipO7Ho.LTSW	Estudiante
-- 13	RePe	$2b$12$IyX2v6aoXLir6u0QFirjquoney/q48LIkT/yMro/RAyuhUGvxyCHy	Estudiante
-- 14	ReginaPerez	$2b$12$9JTwyCcE4XRv6XE/h2RnAeN/A6BuIX4KnUqZUxLQHDQJmPlqMkbQm	Estudiante
-- \.


-- --
-- -- TOC entry 5121 (class 0 OID 0)
-- -- Dependencies: 231
-- -- Name: asistencias_feria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
-- --

-- SELECT pg_catalog.setval('public.asistencias_feria_id_seq', 12, true);


-- --
-- -- TOC entry 5122 (class 0 OID 0)
-- -- Dependencies: 227
-- -- Name: carreras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
-- --

-- SELECT pg_catalog.setval('public.carreras_id_seq', 3, true);


-- --
-- -- TOC entry 5123 (class 0 OID 0)
-- -- Dependencies: 228
-- -- Name: estudiantes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
-- --

-- SELECT pg_catalog.setval('public.estudiantes_id_seq', 11, true);


-- --
-- -- TOC entry 5124 (class 0 OID 0)
-- -- Dependencies: 236
-- -- Name: eventos_feria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
-- --

-- SELECT pg_catalog.setval('public.eventos_feria_id_seq', 2, true);


-- --
-- -- TOC entry 5125 (class 0 OID 0)
-- -- Dependencies: 234
-- -- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
-- --

-- SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 3, true);


-- --
-- -- TOC entry 5126 (class 0 OID 0)
-- -- Dependencies: 230
-- -- Name: preregistros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
-- --

-- SELECT pg_catalog.setval('public.preregistros_id_seq', 11, true);


-- --
-- -- TOC entry 5127 (class 0 OID 0)
-- -- Dependencies: 229
-- -- Name: servicios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
-- --

-- SELECT pg_catalog.setval('public.servicios_id_seq', 13, true);


-- --
-- -- TOC entry 5128 (class 0 OID 0)
-- -- Dependencies: 232
-- -- Name: socios_formadores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
-- --

-- SELECT pg_catalog.setval('public.socios_formadores_id_seq', 20, true);


-- --
-- -- TOC entry 5129 (class 0 OID 0)
-- -- Dependencies: 226
-- -- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
-- --

-- SELECT pg_catalog.setval('public.usuarios_id_seq', 14, true);


-- --
-- -- TOC entry 4936 (class 2606 OID 16583)
-- -- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.password_reset_tokens
--     ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


-- --
-- -- TOC entry 4938 (class 2606 OID 16585)
-- -- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.password_reset_tokens
--     ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


-- --
-- -- TOC entry 4930 (class 2606 OID 16508)
-- -- Name: asistencias_feria pk_asistencias_feria; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.asistencias_feria
--     ADD CONSTRAINT pk_asistencias_feria PRIMARY KEY (id);


-- --
-- -- TOC entry 4906 (class 2606 OID 16437)
-- -- Name: carreras pk_carreras; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.carreras
--     ADD CONSTRAINT pk_carreras PRIMARY KEY (id);


-- --
-- -- TOC entry 4912 (class 2606 OID 16453)
-- -- Name: estudiantes pk_estudiantes; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.estudiantes
--     ADD CONSTRAINT pk_estudiantes PRIMARY KEY (id);


-- --
-- -- TOC entry 4920 (class 2606 OID 16474)
-- -- Name: eventos_feria pk_eventos_feria; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.eventos_feria
--     ADD CONSTRAINT pk_eventos_feria PRIMARY KEY (id);


-- --
-- -- TOC entry 4926 (class 2606 OID 16498)
-- -- Name: preregistros pk_preregistros; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.preregistros
--     ADD CONSTRAINT pk_preregistros PRIMARY KEY (id);


-- --
-- -- TOC entry 4922 (class 2606 OID 16487)
-- -- Name: servicios pk_servicios; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.servicios
--     ADD CONSTRAINT pk_servicios PRIMARY KEY (id);


-- --
-- -- TOC entry 4902 (class 2606 OID 16427)
-- -- Name: usuarios pk_usuarios; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.usuarios
--     ADD CONSTRAINT pk_usuarios PRIMARY KEY (id);


-- --
-- -- TOC entry 4932 (class 2606 OID 16566)
-- -- Name: socios_formadores socios_formadores_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.socios_formadores
--     ADD CONSTRAINT socios_formadores_nombre_key UNIQUE (nombre);


-- --
-- -- TOC entry 4934 (class 2606 OID 16564)
-- -- Name: socios_formadores socios_formadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.socios_formadores
--     ADD CONSTRAINT socios_formadores_pkey PRIMARY KEY (id);


-- --
-- -- TOC entry 4908 (class 2606 OID 16441)
-- -- Name: carreras uc_carreras_abreviatura; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.carreras
--     ADD CONSTRAINT uc_carreras_abreviatura UNIQUE (abreviatura);


-- --
-- -- TOC entry 4910 (class 2606 OID 16439)
-- -- Name: carreras uc_carreras_nombre; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.carreras
--     ADD CONSTRAINT uc_carreras_nombre UNIQUE (nombre);


-- --
-- -- TOC entry 4914 (class 2606 OID 16459)
-- -- Name: estudiantes uc_estudiantes_correo_alterno; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.estudiantes
--     ADD CONSTRAINT uc_estudiantes_correo_alterno UNIQUE (correo_alterno);


-- --
-- -- TOC entry 4916 (class 2606 OID 16457)
-- -- Name: estudiantes uc_estudiantes_matricula; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.estudiantes
--     ADD CONSTRAINT uc_estudiantes_matricula UNIQUE (matricula);


-- --
-- -- TOC entry 4918 (class 2606 OID 16455)
-- -- Name: estudiantes uc_estudiantes_usuario_id; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.estudiantes
--     ADD CONSTRAINT uc_estudiantes_usuario_id UNIQUE (usuario_id);


-- --
-- -- TOC entry 4924 (class 2606 OID 16489)
-- -- Name: servicios uc_servicios_CRN; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.servicios
--     ADD CONSTRAINT "uc_servicios_CRN" UNIQUE (crn);


-- --
-- -- TOC entry 4904 (class 2606 OID 16429)
-- -- Name: usuarios uc_usuarios_username; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.usuarios
--     ADD CONSTRAINT uc_usuarios_username UNIQUE (username);


-- --
-- -- TOC entry 4928 (class 2606 OID 16545)
-- -- Name: preregistros uq_estudiante_servicio; Type: CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.preregistros
--     ADD CONSTRAINT uq_estudiante_servicio UNIQUE (estudiante_id, servicio_id);


-- --
-- -- TOC entry 4945 (class 2606 OID 16804)
-- -- Name: asistencias_feria asistencias_feria_servicio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.asistencias_feria
--     ADD CONSTRAINT asistencias_feria_servicio_id_fkey FOREIGN KEY (servicio_id) REFERENCES public.servicios(id) ON DELETE SET NULL;


-- --
-- -- TOC entry 4946 (class 2606 OID 16534)
-- -- Name: asistencias_feria fk_asistencias_feria_estudiante_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.asistencias_feria
--     ADD CONSTRAINT fk_asistencias_feria_estudiante_id FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id);


-- --
-- -- TOC entry 4947 (class 2606 OID 16539)
-- -- Name: asistencias_feria fk_asistencias_feria_evento_feria_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.asistencias_feria
--     ADD CONSTRAINT fk_asistencias_feria_evento_feria_id FOREIGN KEY (evento_feria_id) REFERENCES public.eventos_feria(id);


-- --
-- -- TOC entry 4939 (class 2606 OID 16514)
-- -- Name: estudiantes fk_estudiantes_carrera_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.estudiantes
--     ADD CONSTRAINT fk_estudiantes_carrera_id FOREIGN KEY (carrera_id) REFERENCES public.carreras(id);


-- --
-- -- TOC entry 4940 (class 2606 OID 16509)
-- -- Name: estudiantes fk_estudiantes_usuario_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.estudiantes
--     ADD CONSTRAINT fk_estudiantes_usuario_id FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


-- --
-- -- TOC entry 4943 (class 2606 OID 16524)
-- -- Name: preregistros fk_preregistros_estudiante_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.preregistros
--     ADD CONSTRAINT fk_preregistros_estudiante_id FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id);


-- --
-- -- TOC entry 4944 (class 2606 OID 16529)
-- -- Name: preregistros fk_preregistros_servicio_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.preregistros
--     ADD CONSTRAINT fk_preregistros_servicio_id FOREIGN KEY (servicio_id) REFERENCES public.servicios(id);


-- --
-- -- TOC entry 4941 (class 2606 OID 16519)
-- -- Name: servicios fk_servicios_evento_feria_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.servicios
--     ADD CONSTRAINT fk_servicios_evento_feria_id FOREIGN KEY (evento_feria_id) REFERENCES public.eventos_feria(id);


-- --
-- -- TOC entry 4948 (class 2606 OID 16586)
-- -- Name: password_reset_tokens password_reset_tokens_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.password_reset_tokens
--     ADD CONSTRAINT password_reset_tokens_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


-- --
-- -- TOC entry 4942 (class 2606 OID 16567)
-- -- Name: servicios servicios_socio_formador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
-- --

-- ALTER TABLE ONLY public.servicios
--     ADD CONSTRAINT servicios_socio_formador_id_fkey FOREIGN KEY (socio_formador_id) REFERENCES public.socios_formadores(id);


-- -- Completed on 2026-03-22 19:22:39

-- --
-- -- PostgreSQL database dump complete
-- --

-- \unrestrict XH8uvXm2wVvrrmZ5yhqxeKAuCKvGsv9w81JKc2wXa4CW0DyAoPuisviSL4X4ihS

