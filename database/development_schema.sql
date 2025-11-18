create database asistencia_db;

use asistencia_db;

create table roles(
rol_id int unsigned auto_increment primary key,
nombre_rol varchar(20) not null
);

create table empleados(
empleado_id int unsigned auto_increment primary key,
nombre varchar(100) not null,
apellido varchar(100) not null,
correo varchar(100) unique null,
usuario varchar(30) unique not null,
contrasenia varchar(255) not null,
cod_empleado varchar(20) unique not null,
rol_id int unsigned not null,

foreign key (rol_id) references roles(rol_id)
);

create table registros_asistencia(
registro_id int unsigned auto_increment primary key,
tipo_movimiento varchar(10) not null,
fecha_hora datetime,
em_registrado_id int unsigned not null,
em_qregistra_id int unsigned not null,

foreign key (em_registrado_id) references empleados(empleado_id),
foreign key (em_qregistra_id) references empleados(empleado_id)
);

insert into roles(nombre_rol) values 
("admin"),
("portero"),
("empleado");

insert into roles(nombre_rol) values ("admin-qr");

show tables from asistencia_db

insert into empleados(nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id) values 
("Jhon", "Doe", "jhondoe@gmail.com", "jhon_doe", "$2b$10$jxU/PpcWVG5DTnY.oRSYjOx5az4S9dkQgUDEPI2yUsaYHZGA1ftXK", "jd", (select rol_id from roles where nombre_rol = "empleado"));

insert into empleados(nombre, apellido, usuario, contrasenia, rol_id, empresa_id, cod_empleado) values 
("Sistema", "QR", "qr_user", "$2b$10$M98g3nYo4mn5kgpoXsMRye8sUI0n8iYX2E4bNEFx.A63MnA7p4Iy.", (select rol_id from roles where nombre_rol = "admin-qr"), 1, "qr-001");


alter table empleados
add column supervisor_id int unsigned,
add column metodo_registro enum('QR', 'MANUAL') default 'QR',
add column em_activo boolean default true;

alter table empleados
add constraint fk_empleado_supervisor
foreign key (supervisor_id) references empleados(empleado_id)
on delete set null
on update cascade;

alter table empleados change column em_activo activo boolean default true;

alter table registros_asistencia 
add column firma_digital mediumtext null;

alter table registros_asistencia
change column em_registrado_id empleado_registrado_id int unsigned not null,
change column em_qregistra_id registrado_por_id int unsigned not null;

describe registros_asistencia;

SHOW CREATE TABLE registros_asistencia;

alter table registros_asistencia
drop foreign key registros_asistencia_ibfk_1,
drop foreign key registros_asistencia_ibfk_2;

alter table registros_asistencia
add constraint fk_registro_empleado
    foreign key (empleado_registrado_id) REFERENCES empleados(empleado_id)
    on delete restrict on update cascade,
add constraint fk_registro_portero  
    foreign key (registrado_por_id) REFERENCES empleados(empleado_id)
    on delete restrict on update cascade;

alter table registros_asistencia
modify column tipo_movimiento enum('ENTRADA', 'SALIDA') not null;

alter table registros_asistencia
add column metodo_registro enum('QR', 'MANUAL') not null after tipo_movimiento;

describe registros_asistencia;

create table solicitudes_ajuste(
solicitud_id int unsigned auto_increment primary key,
empleado_id int unsigned not null,
tipo_movimiento enum('ENTRADA', 'SALIDA') not null,
hora_solicitada datetime not null,
justificacion text not null,
estado enum('PENDIENTE', 'APROBADO', 'RECHAZADO') not null default 'PENDIENTE',
aprobado_por_id int unsigned null,
fecha_solicitud datetime default current_timestamp,
fecha_respuesta datetime null) engine=InnoDB default charset=utf8mb4;

alter table solicitudes_ajuste
add constraint fk_solicitud_empleado
foreign key (empleado_id) references empleados(empleado_id)
on delete restrict on update cascade;

alter table solicitudes_ajuste
add constraint fk_solicitud_supervisor
foreign key (aprobado_por_id) references empleados(empleado_id)
on delete restrict on update cascade

create table empresas(
empresa_id int unsigned auto_increment primary key,
nombre_empresa varchar(100) not null,
nit varchar(20) unique not null,
activo boolean default true
) engine=InnoDB default charset=utf8mb4;

insert into empresas(nombre_empresa, nit) values
('METROSINU S.A.', '812007584-7'),
('MONTERIA EXPRESS S.A.', '830514696-3');

select * from empresas;

alter table empleados
add column empresa_id int unsigned null after rol_id;

describe empleados;

update empleados set empresa_id=1;

select empleado_id, nombre, apellido, empresa_id from empleados;

alter table empleados
modify column empresa_id int unsigned not null;

alter table empleados
add constraint fk_empleados_empresa
foreign key (empresa_id) references empresas(empresa_id)
on delete restrict on update cascade;

show create table empleados;

SELECT 
	e.empleado_id,
    e.nombre,
    e.apellido,
    emp.nombre_empresa,
    r.nombre_rol
FROM empleados e
JOIN empresas emp ON e.empresa_id = emp.empresa_id
JOIN roles r ON e.rol_id = r.rol_id
WHERE e.empleado_id = 1;

select * from roles;

insert into roles(nombre_rol) values ("supervisor");


SET @password_hash = '$2b$10$jxU/PpcWVG5DTnY.oRSYjOx5az4S9dkQgUDEPI2yUsaYHZGA1ftXK';

INSERT INTO empleados (nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, metodo_registro, activo)
VALUES ('Carlos', 'Rodríguez', 'carlos.rodriguez@metrosinu.com', 'carlos_admin', @password_hash, 1, 1, 1, NULL, 'QR', TRUE);

INSERT INTO empleados (nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, metodo_registro, activo)
VALUES ('María', 'González', 'maria.gonzalez@monteriaexpress.com', 'maria_admin', @password_hash, 2, 1, 2, NULL, 'QR', TRUE);

SELECT empleado_id, nombre, apellido, cod_empleado, rol_id, empresa_id, supervisor_id FROM empleados;

-- Supervisor de METROSINU (supervisado por Carlos, empleado_id=2)
INSERT INTO empleados (nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, metodo_registro, activo)
VALUES ('Ana', 'Martínez', 'ana.martinez@metrosinu.com', 'ana_supervisor', @password_hash, 'MTRO-002', 4, 1, 2, 'QR', TRUE);

-- Supervisor de MONTERIA EXPRESS (supervisado por María, empleado_id=3)
INSERT INTO empleados (nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, metodo_registro, activo)
VALUES ('Sofía', 'López', 'sofia.lopez@monteriaexpress.com', 'sofia_supervisor', @password_hash, 'MNTE-002', 4, 2, 3, 'QR', TRUE);

-- METROSINU S.A. - Empleados de Ana (supervisor_id = 4, que será el ID de Ana)
INSERT INTO empleados (nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, metodo_registro, activo)
VALUES 
('Juan', 'Pérez', 'juan.perez@metrosinu.com', 'juan_empleado', @password_hash, 'MTRO-003', 3, 1, 4, 'QR', TRUE),
('Pedro', 'Ramírez', 'pedro.ramirez@metrosinu.com', 'pedro_empleado', @password_hash, 'MTRO-004', 3, 1, 4, 'MANUAL', TRUE),
('Luis', 'Gómez', 'luis.gomez@metrosinu.com', 'luis_portero', @password_hash, 'MTRO-005', 2, 1, 4, 'QR', TRUE);

-- MONTERIA EXPRESS S.A. - Empleados de Sofía (supervisor_id = 5, que será el ID de Sofía)
INSERT INTO empleados (nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, metodo_registro, activo)
VALUES 
('Diego', 'Torres', 'diego.torres@monteriaexpress.com', 'diego_empleado', @password_hash, 'MNTE-003', 3, 2, 5, 'QR', TRUE),
('Laura', 'Vargas', 'laura.vargas@monteriaexpress.com', 'laura_empleado', @password_hash, 'MNTE-004', 3, 2, 5, 'MANUAL', TRUE),
('Roberto', 'Silva', 'roberto.silva@monteriaexpress.com', 'roberto_portero', @password_hash, 'MNTE-005', 2, 2, 5, 'QR', TRUE);

SELECT 
    e.empleado_id,
    e.nombre,
    e.apellido,
    e.cod_empleado,
    r.nombre_rol AS rol,
    emp.nombre_empresa AS empresa,
    e.metodo_registro,
    CONCAT(s.nombre, ' ', s.apellido) AS supervisor
FROM empleados e
JOIN roles r ON e.rol_id = r.rol_id
JOIN empresas emp ON e.empresa_id = emp.empresa_id
LEFT JOIN empleados s ON e.supervisor_id = s.empleado_id
ORDER BY e.empresa_id, e.rol_id, e.empleado_id;

SELECT 
    emp.nombre_empresa,
    r.nombre_rol,
    COUNT(*) as cantidad
FROM empleados e
JOIN empresas emp ON e.empresa_id = emp.empresa_id
JOIN roles r ON e.rol_id = r.rol_id
GROUP BY emp.nombre_empresa, r.nombre_rol
ORDER BY emp.nombre_empresa, r.nombre_rol;


-- Ver estructura de la tabla
DESCRIBE empleados;