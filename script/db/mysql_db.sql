SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';
 
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci ;
USE `mydb` ;
 
-- -----------------------------------------------------
-- Table `mydb`.`user`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `mydb`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `username` VARCHAR(128) NOT NULL ,
  `verifier` VARCHAR(256) NOT NULL ,
  `salt` VARCHAR(32) NOT NULL ,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB
COMMENT = '\n';
 
 
-- -----------------------------------------------------
-- Table `mydb`.`password`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `mydb`.`password` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `data` TEXT NULL ,
  `username` VARCHAR(128) NOT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_password_users` (`username` ASC) ,
  CONSTRAINT `fk_password_users`
    FOREIGN KEY (`username` )
    REFERENCES `mydb`.`user` (`username` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
 
 
 
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;