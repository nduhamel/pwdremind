<?php

    require_once('../config.php');

    if (PDO_DRIVER == 'sqlite') {
        $db = new PDO(PDO_DSN);
    }
    else {
        $db = new PDO(PDO_DSN, PDO_USER, PDO_PASSWORD);
    }

    class SRPOptions {

        public function Nhex() { return '0115b8b692e0e045692cf280b436735c77a5a9e8a9e7ed56c965f87db5b2a2ece3'; }
        public function Ndec() { return '125617018995153554710546479714086468244499594888726646874671447258204721048803'; }
        public function ghex() { return '33'; }
        public function gdec() { return '51'; }
        public function random_salt() { return secure_random(80); }
        public function hashHex($input) {
            return sha1(pack("H*",$input));
        }
    }

    function secure_random($bits) {
        $result = '';
        $digits = array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f');
        $f = fopen("/dev/urandom","r");
        $randomBytes = fread($f, $bits/8);
        fclose($f);

        $len = strlen($randomBytes);
        $b = 0;

        for ($i=0;$i<$len;$i++) {
            $b = ord($randomBytes[$i]);
            $result = $result.$digits[($b & 0xF0) >> 4];
            $result = $result.$digits[$b & 0x0F];
        }
        return $result;
    }

    function byte2hex($bytes) {
        $digits = array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f');
        $hex = '';
        $len = strlen($bytes);
        for ($i=0;$i<$len;$i++) {
            $b = ord($bytes[$i]) & 0xFF;
            $hex = $hex.$digits[($b & 0xF0) >> 4];
            $hex = $hex.$digits[$b & 0x0F];
        }
        return $hex;
    }

    function strToHex ($string) {
        $hex='';
        for ($i=0; $i < strlen($string); $i++) {
            $hex .= dechex(ord($string[$i]));
        }
        return $hex;
    }

    function hex2dec($hex) {
        $dec = '0';
        $pow = '1';
        for ($i=strlen($hex)-1;$i>=0;$i--) {
            $digit = ord($hex[$i]);
            $digit = $digit>96?($digit ^ 96)+9:$digit ^ 48;
            $dec=bcadd($dec,bcmul($pow,$digit));
            $pow=bcmul($pow,'16');
        }
        return $dec;
    }

    function dec2hex($dec) {
        $digits = array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f');
        $hex = '';
        do {
            $digit = bcmod($dec,'16');
            $dec = bcdiv($dec,16);
            $hex = $digits[$digit].$hex;
        } while (bccomp($dec, '0'));
        return $hex;
    }

    function computverifier($srp, $user, $pwd, $salt) {
        // private key
        $innerHash = $srp->hashHex(strToHex($user).'3a'.strToHex($pwd));
        $privateKey = $srp->hashHex($salt.$innerHash);

        // verifier
        $tmp = dec2hex(bcpowmod($srp->gdec(), hex2dec($privateKey), $srp->Ndec()));
        $verifier = str_pad($tmp , strlen($srp->Nhex()), "0", STR_PAD_LEFT);
        return $verifier;
    }

    $srp = new SRPOptions();

    // Get information FROM ". DB_PREFIX ."user
    fwrite(STDOUT, "Please enter username: ");
    $name = trim(fgets(STDIN));
    fwrite(STDOUT, "Please enter password: ");
    $password = trim(fgets(STDIN));

    // salt
    $salt = $srp->random_salt();

    // verifier
    $verifier = computverifier($srp, $name, $password, $salt);

    // Show results:
    fwrite(STDOUT,"Results:\n");
    fwrite(STDOUT,"Username: $name\n");
    fwrite(STDOUT,"Salt: $salt\n");
    fwrite(STDOUT,"Verifier: $verifier\n");
    fwrite(STDOUT,"Adding user: \n");

    //Adding user to the database
    try {
        $req = "INSERT INTO user (username, verifier, salt, config)
                VALUES ('".$name."', '".$verifier."', '".$salt."', '{}')";
        $db->query($req);
        fwrite(STDOUT,"User added!\n");
    } catch (PDOException $e) {
        fwrite(STDOUT,"Error : ". $e->getMessage() ."\n");
    }


