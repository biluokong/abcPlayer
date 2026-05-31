/*
 Navicat Premium Data Transfer

 Source Server         : pgsql
 Source Server Type    : PostgreSQL
 Source Server Version : 180003 (180003)
 Source Host           : 43.226.44.12:5432
 Source Catalog        : postgres
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 180003 (180003)
 File Encoding         : 65001

 Date: 30/05/2026 19:10:40
*/


-- ----------------------------
-- Sequence structure for sys_dict_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."sys_dict_id_seq";
CREATE SEQUENCE "public"."sys_dict_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for sys_user_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."sys_user_id_seq";
CREATE SEQUENCE "public"."sys_user_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for sys_user_token_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."sys_user_token_id_seq";
CREATE SEQUENCE "public"."sys_user_token_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Table structure for sys_dict
-- ----------------------------
DROP TABLE IF EXISTS "public"."sys_dict";
CREATE TABLE "public"."sys_dict" (
  "id" int8 NOT NULL DEFAULT nextval('sys_dict_id_seq'::regclass),
  "dict_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "dict_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "dict_value" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "parent_id" int8 DEFAULT 0,
  "sort_order" int4 DEFAULT 0,
  "status" int2 DEFAULT 1,
  "is_default" bool DEFAULT false,
  "css_class" varchar(100) COLLATE "pg_catalog"."default",
  "list_class" varchar(100) COLLATE "pg_catalog"."default",
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "update_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "remark" varchar(500) COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "public"."sys_dict"."id" IS '字典项ID';
COMMENT ON COLUMN "public"."sys_dict"."dict_type" IS '字典类型（如：menu_type表示菜单类型）';
COMMENT ON COLUMN "public"."sys_dict"."dict_name" IS '字典显示名称';
COMMENT ON COLUMN "public"."sys_dict"."dict_value" IS '字典值（如菜单权限标识）';
COMMENT ON COLUMN "public"."sys_dict"."parent_id" IS '父级ID，支持树形结构';
COMMENT ON COLUMN "public"."sys_dict"."sort_order" IS '排序顺序';
COMMENT ON COLUMN "public"."sys_dict"."status" IS '状态：0-禁用，1-启用';
COMMENT ON COLUMN "public"."sys_dict"."is_default" IS '是否为默认选项';
COMMENT ON COLUMN "public"."sys_dict"."css_class" IS '前端CSS类名';
COMMENT ON COLUMN "public"."sys_dict"."list_class" IS '列表展示样式类';
COMMENT ON COLUMN "public"."sys_dict"."create_time" IS '记录创建时间';
COMMENT ON COLUMN "public"."sys_dict"."update_time" IS '记录更新时间';
COMMENT ON COLUMN "public"."sys_dict"."remark" IS '备注信息';
COMMENT ON TABLE "public"."sys_dict" IS '系统字典表';

-- ----------------------------
-- Records of sys_dict
-- ----------------------------
INSERT INTO "public"."sys_dict" VALUES (2, 'menu', '音乐播放', 'index', 0, 2, 1, 'f', NULL, NULL, '2026-05-29 12:22:37.032329', '2026-05-29 12:22:37.032329', 'abc播放');
INSERT INTO "public"."sys_dict" VALUES (3, 'menu', '番茄简谱转换', 'fqConvertAbc', 0, 3, 1, 'f', NULL, NULL, '2026-05-29 12:22:37.032329', '2026-05-29 12:22:37.032329', 'fq乐谱转abc');
INSERT INTO "public"."sys_dict" VALUES (1, 'menu', '用户管理', 'userManage', 0, 1, 1, 'f', NULL, NULL, '2026-05-29 12:22:37.032329', '2026-05-29 12:22:37.032329', '系统');

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS "public"."sys_user";
CREATE TABLE "public"."sys_user" (
  "id" int8 NOT NULL DEFAULT nextval('sys_user_id_seq'::regclass),
  "username" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "menu_permissions" text COLLATE "pg_catalog"."default",
  "nickname" varchar(50) COLLATE "pg_catalog"."default",
  "email" varchar(100) COLLATE "pg_catalog"."default",
  "phone" varchar(20) COLLATE "pg_catalog"."default",
  "avatar" varchar(200) COLLATE "pg_catalog"."default",
  "status" int2 DEFAULT 1,
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "update_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "last_login_time" timestamp(6),
  "remark" varchar(500) COLLATE "pg_catalog"."default",
  "expiration_time" timestamp(6)
)
;
COMMENT ON COLUMN "public"."sys_user"."id" IS '用户ID';
COMMENT ON COLUMN "public"."sys_user"."username" IS '用户名';
COMMENT ON COLUMN "public"."sys_user"."password" IS '密码（应加密存储）';
COMMENT ON COLUMN "public"."sys_user"."menu_permissions" IS '菜单权限（多个权限标识用逗号分隔，对应sys_dict表中dict_type为menu_type的dict_value）';
COMMENT ON COLUMN "public"."sys_user"."nickname" IS '用户昵称';
COMMENT ON COLUMN "public"."sys_user"."email" IS '邮箱地址';
COMMENT ON COLUMN "public"."sys_user"."phone" IS '手机号码';
COMMENT ON COLUMN "public"."sys_user"."avatar" IS '用户头像URL';
COMMENT ON COLUMN "public"."sys_user"."status" IS '用户状态：0-禁用，1-启用';
COMMENT ON COLUMN "public"."sys_user"."create_time" IS '记录创建时间';
COMMENT ON COLUMN "public"."sys_user"."update_time" IS '记录更新时间';
COMMENT ON COLUMN "public"."sys_user"."last_login_time" IS '最后登录时间';
COMMENT ON COLUMN "public"."sys_user"."remark" IS '备注信息';
COMMENT ON COLUMN "public"."sys_user"."expiration_time" IS '过期时间';
COMMENT ON TABLE "public"."sys_user" IS '系统用户表';

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO "public"."sys_user" VALUES (1, 'admin', '797799421erER', 'index,fqConvertAbc,userManage', '小碧落', 'admin@example.com', '13800138000', NULL, 1, '2026-05-29 12:23:01.589484', '2026-05-29 12:23:01.589484', '2026-05-30 10:56:35.862646', '超级管理员', NULL);
INSERT INTO "public"."sys_user" VALUES (7, 'test1', '111111', 'index', '小碧落', NULL, NULL, NULL, 1, '2026-05-30 11:00:53.185907', '2026-05-30 11:00:53.186374', '2026-05-30 11:01:07.087763', '测试用户', NULL);

-- ----------------------------
-- Table structure for sys_user_token
-- ----------------------------
DROP TABLE IF EXISTS "public"."sys_user_token";
CREATE TABLE "public"."sys_user_token" (
  "id" int8 NOT NULL DEFAULT nextval('sys_user_token_id_seq'::regclass),
  "user_id" int8 NOT NULL,
  "token_jti" varchar(128) COLLATE "pg_catalog"."default" NOT NULL,
  "token_expire_time" timestamp(6) NOT NULL,
  "device_info" varchar(200) COLLATE "pg_catalog"."default",
  "login_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "update_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "device_addr" varchar(100) COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "public"."sys_user_token"."id" IS '记录ID';
COMMENT ON COLUMN "public"."sys_user_token"."user_id" IS '用户ID';
COMMENT ON COLUMN "public"."sys_user_token"."token_jti" IS 'JWT 的唯一标识（jti）';
COMMENT ON COLUMN "public"."sys_user_token"."token_expire_time" IS 'token 的过期时间';
COMMENT ON COLUMN "public"."sys_user_token"."device_info" IS '设备信息';
COMMENT ON COLUMN "public"."sys_user_token"."login_time" IS '登录时间';
COMMENT ON COLUMN "public"."sys_user_token"."update_time" IS '记录更新时间';
COMMENT ON COLUMN "public"."sys_user_token"."device_addr" IS '设备地址';
COMMENT ON TABLE "public"."sys_user_token" IS '用户token表';

-- ----------------------------
-- Records of sys_user_token
-- ----------------------------
INSERT INTO "public"."sys_user_token" VALUES (8, 1, '8e9ddc8134ef4c4aa7a6b719532db452', '2026-05-30 12:56:35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0', '2026-05-30 10:56:36.298908', '2026-05-30 15:20:15.272679', '223.167.17.26:16815');
INSERT INTO "public"."sys_user_token" VALUES (11, 7, 'de95417c95204b209161ad744331468e', '2026-05-30 13:01:07', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0', '2026-05-30 11:01:07.132215', '2026-05-30 11:01:07.137949', '223.167.17.26:15384');

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."sys_dict_id_seq"
OWNED BY "public"."sys_dict"."id";
SELECT setval('"public"."sys_dict_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."sys_user_id_seq"
OWNED BY "public"."sys_user"."id";
SELECT setval('"public"."sys_user_id_seq"', 7, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."sys_user_token_id_seq"
OWNED BY "public"."sys_user_token"."id";
SELECT setval('"public"."sys_user_token_id_seq"', 11, true);

-- ----------------------------
-- Indexes structure for table sys_dict
-- ----------------------------
CREATE INDEX "idx_dict_type" ON "public"."sys_dict" USING btree (
  "dict_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_parent_id" ON "public"."sys_dict" USING btree (
  "parent_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table sys_dict
-- ----------------------------
ALTER TABLE "public"."sys_dict" ADD CONSTRAINT "uk_dict_type_value" UNIQUE ("dict_type", "dict_value");

-- ----------------------------
-- Primary Key structure for table sys_dict
-- ----------------------------
ALTER TABLE "public"."sys_dict" ADD CONSTRAINT "sys_dict_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table sys_user
-- ----------------------------
CREATE INDEX "idx_status" ON "public"."sys_user" USING btree (
  "status" "pg_catalog"."int2_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "idx_username" ON "public"."sys_user" USING btree (
  "username" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table sys_user
-- ----------------------------
ALTER TABLE "public"."sys_user" ADD CONSTRAINT "sys_user_username_key" UNIQUE ("username");

-- ----------------------------
-- Primary Key structure for table sys_user
-- ----------------------------
ALTER TABLE "public"."sys_user" ADD CONSTRAINT "sys_user_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table sys_user_token
-- ----------------------------
CREATE INDEX "idx_user_token_jti" ON "public"."sys_user_token" USING btree (
  "token_jti" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table sys_user_token
-- ----------------------------
ALTER TABLE "public"."sys_user_token" ADD CONSTRAINT "sys_user_token_user_id_key" UNIQUE ("user_id");

-- ----------------------------
-- Primary Key structure for table sys_user_token
-- ----------------------------
ALTER TABLE "public"."sys_user_token" ADD CONSTRAINT "sys_user_token_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table sys_user_token
-- ----------------------------
ALTER TABLE "public"."sys_user_token" ADD CONSTRAINT "fk_user_token_user" FOREIGN KEY ("user_id") REFERENCES "public"."sys_user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
