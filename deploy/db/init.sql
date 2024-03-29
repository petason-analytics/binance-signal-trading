-- MySQL Script generated by MySQL Workbench
-- Wed Feb 16 17:50:49 2022
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema lucis-launchpad
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema lucis-launchpad
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `lucis-launchpad` DEFAULT CHARACTER SET utf8 ;
USE `lucis-launchpad` ;

-- -----------------------------------------------------
-- Table `lucis-launchpad`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lucis-launchpad`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(45) NULL COMMENT 'User Code, use for ref code and hide user real inc ID',
  `address_bsc` VARCHAR(45) NULL COMMENT 'User login with this wallet',
  `address_near` VARCHAR(45) NULL COMMENT 'User login with this wallet',
  `name` VARCHAR(45) NULL,
  `ref_code` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lucis-launchpad`.`user_profiles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lucis-launchpad`.`user_profiles` (
  `user_id` INT NOT NULL,
  `twitter` VARCHAR(45) NULL,
  `facebook` VARCHAR(45) NULL,
  `telegram` VARCHAR(45) NULL,
  `discord` VARCHAR(45) NULL,
  `phone` VARCHAR(45) NULL,
  `email` VARCHAR(45) NULL,
  `avatar` VARCHAR(45) NULL,
  `cover` VARCHAR(45) NULL,
  PRIMARY KEY (`user_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lucis-launchpad`.`games`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lucis-launchpad`.`games` (
  `uid` VARCHAR(16) NOT NULL COMMENT 'uuid',
  `name` VARCHAR(45) NULL,
  `desc` TEXT NULL COMMENT 'Tell us about your project?(khi nào ra game, testnet, mainnet, đã có game đang chạy chưa, trên đâu, nếu chưa có thì khi nào ra, nếu đang chạy thì số lượng user là bn, …, team, token allocation if)',
  `desc_team` TEXT NULL,
  `website` VARCHAR(45) NULL,
  `whitepaper` VARCHAR(45) NULL,
  `pitchdeck` VARCHAR(45) NULL,
  `trailer_video` VARCHAR(45) NULL,
  `facebook` VARCHAR(45) NULL,
  `twitter` VARCHAR(45) NULL,
  `telegram` VARCHAR(45) NULL,
  `youtube` VARCHAR(45) NULL,
  PRIMARY KEY (`uid`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lucis-launchpad`.`box_campaigns`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lucis-launchpad`.`box_campaigns` (
  `uid` VARCHAR(16) NOT NULL,
  `game_uid` VARCHAR(45) NULL,
  `desc` TEXT NULL,
  `rules` VARCHAR(45) NULL,
  `cover_img` TEXT NULL,
  `rounds` JSON NULL COMMENT 'type Round  {\n	name: string,\n	is_whitelist?: bool,\n	require_whitelist?: bool,\n	start: Date, \n	end: Date,\n	participant_limit?: 500, // chi 500 người được tham gia whitelist\n	box_limit_per_user: 5,\n	box_limit_this_phase' /* comment truncated */ /* 10,
}

timeline =  [
	upcoming: {
		cứ game mới được list lên hệ thống (sẽ mở bán trong tương lai) thì là upcoming,
		phụ thuộc vào box_campaigns.start 
	},
	whitelist_registration as Round: {
		name: “whitelist registration”
		is_whitelist_registration: true,
		start: 2022-02-28 6:00pm
		end: 2022-02-28 9:00pm
		participant_limit: 500, // chi 500 người được tham gia whitelist
	},
	phase0 as Round: {
		name: “whitelist registration”
		start: 2022-03-06 6:00pm
		end: 2022-02-28 9:00pm
		box_limit_per_user: 5,
		box_limit_this_phase: 10,
		require_whitelist: true,
	},
	phase 1 as Round:  {
		name: Phase 1
		start: 2022-03-06 6:00pm
		end: 2022-02-28 9:00pm
		require_whitelist: true,
	},
	phase 2 as Round:  {
		name: Phase 2,
		start: 2022-03-06 6:00pm
		end: 2022-02-28 9:00pm
		require_whitelist: false,
	},
	…,
	closed ==> Là status,
]*/,
  `status` ENUM('upcoming', 'opening', 'closed') NULL COMMENT 'Upcoming: Going to open, or whitelist registration phase\nOpening: sell box phase is Opening\nClosed: Ended',
  `start` VARCHAR(45) NULL COMMENT 'Upcoming = Trước tgian start\nBắt đầu từ Whitelist registration trở đi (nếu có)',
  `end` VARCHAR(45) NULL COMMENT 'closed time, sau khi kết thúc mọi round',
  `highlight` VARCHAR(100) NULL COMMENT 'Các câu làm màu, kết quả bán box, …. Eg: Sold out in first 5 minutes',
  `spotlight_position` INT NULL COMMENT 'null mean no spotlight or a INT mean its has a position in spotlight section, use this for arrangement',
  PRIMARY KEY (`uid`),
  INDEX `fk_box_campaigns_games_idx` (`game_uid` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lucis-launchpad`.`currencies`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lucis-launchpad`.`currencies` (
  `uid` VARCHAR(16) NOT NULL,
  `symbol` VARCHAR(45) NULL,
  `chain_symbol` VARCHAR(10) NULL COMMENT 'which blockchain?',
  `address` VARCHAR(45) NULL COMMENT 'contract address',
  `owner` VARCHAR(45) NULL COMMENT 'Owner address',
  PRIMARY KEY (`uid`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lucis-launchpad`.`chains`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lucis-launchpad`.`chains` (
  `symbol` VARCHAR(10) NOT NULL,
  `name` VARCHAR(45) NULL,
  `chain_id` VARCHAR(10) NULL COMMENT 'Chain id, 1: ETH, 97: BSC Testnet, …, May be NEAR will ne string instead',
  `status` TINYINT(1) NULL,
  PRIMARY KEY (`symbol`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lucis-launchpad`.`box_types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lucis-launchpad`.`box_types` (
  `uid` VARCHAR(16) NOT NULL COMMENT 'Eg: Legendary',
  `box_campaign_uid` VARCHAR(16) NULL,
  `name` VARCHAR(45) NULL,
  `total_amount` VARCHAR(45) NULL,
  `sold_amount` VARCHAR(45) NULL,
  `thumb_img` VARCHAR(45) NULL,
  `series_content` VARCHAR(45) NULL,
  PRIMARY KEY (`uid`),
  INDEX `fk_box_types_box_campaigns1_idx` (`box_campaign_uid` ASC) VISIBLE)
ENGINE = InnoDB
COMMENT = 'Each box campaign has some box types to sell:\n\n[\n	{\n		type: Legendary,\n		name,\n		total_amount,\n		sold_amount,\n		// __how_much_price__on_which_chain, // 1BNB (BSC) or 300TUSD (NEAR)\n		// Se hien thi \n		prices: {\n			BSC: {\n				price: 1,\n				currency: BUSD,\n				chain: BSC,\n			},\n			NEAR: {\n				price: 300,\n				currency: TUSD,\n				chain: NEAR,\n			},\n		},\n		thumb_img,\n		series_content,\n	},\n]';


-- -----------------------------------------------------
-- Table `lucis-launchpad`.`box_prices`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lucis-launchpad`.`box_prices` (
  `uid` VARCHAR(16) NOT NULL,
  `box_type_uid` VARCHAR(45) NULL,
  `chain_symbol` VARCHAR(45) NULL COMMENT 'blockchains.symbol',
  `currency_symbol` VARCHAR(45) NULL COMMENT 'tokens.symbol',
  `price` DECIMAL(20,8) NULL,
  PRIMARY KEY (`uid`),
  INDEX `fk_box_prices_box_types1_idx` (`box_type_uid` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lucis-launchpad`.`nft_box_contracts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lucis-launchpad`.`nft_box_contracts` (
  `uid` VARCHAR(16) NOT NULL,
  `box_campaign_uid` VARCHAR(45) NULL,
  `address` VARCHAR(45) NULL DEFAULT 'Contract address',
  `owner` VARCHAR(45) NULL,
  `chain_symbol` VARCHAR(10) NULL,
  `currency_symbol` VARCHAR(45) NULL COMMENT 'token_id mean NFT item id on contract',
  PRIMARY KEY (`uid`),
  INDEX `fk_nft_box_contracts_box_campaigns1_idx` (`box_campaign_uid` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lucis-launchpad`.`box_campaign_buy_histories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lucis-launchpad`.`box_campaign_buy_histories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(45) NULL,
  `box_campaign_uid` VARCHAR(16) NULL,
  `round` JSON NULL COMMENT 'see box_campaign.rounds for more details',
  `quantity` VARCHAR(45) NULL,
  `box_price_uid` VARCHAR(45) NULL,
  `tx_hash` VARCHAR(45) NULL,
  `status` ENUM('pending', 'confirming', 'confirmed') NULL COMMENT 'pending: backend received\nprocessing: blockchain processing\nsucceed: Blockchain successfully confirmed\nfailed: Blockchain failed',
  PRIMARY KEY (`id`),
  INDEX `user_id` (`user_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lucis-launchpad`.`box_campaign_whitelists`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lucis-launchpad`.`box_campaign_whitelists` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `box_campaign_uid` VARCHAR(45) NULL,
  `user_id` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_box_campaign_whitelists_box_campaigns1_idx` (`box_campaign_uid` ASC) VISIBLE,
  INDEX `fk_box_campaign_whitelists_users1_idx` (`user_id` ASC) VISIBLE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
