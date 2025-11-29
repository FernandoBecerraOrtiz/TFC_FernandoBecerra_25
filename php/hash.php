<?php

echo 'contraseña admin hash: ' . password_hash('admin', PASSWORD_DEFAULT) . PHP_EOL;

echo 'contraseña 123 hash: ' . password_hash('123', PASSWORD_DEFAULT) . PHP_EOL;

echo 'contraseña 456 hash: ' . password_hash('456', PASSWORD_DEFAULT) . PHP_EOL;

echo 'contraseña lucia123 hash: ' . password_hash('lucia123', PASSWORD_DEFAULT) . PHP_EOL;

echo 'contraseña andres123 hash: ' . password_hash('andres123', PASSWORD_DEFAULT) . PHP_EOL;

echo 'contraseña rosa123 hash: ' . password_hash('rosa123', PASSWORD_DEFAULT) . PHP_EOL;

echo 'contraseña javier123 hash: ' . password_hash('javier123', PASSWORD_DEFAULT) . PHP_EOL;

echo 'contraseña sofia123 hash: ' . password_hash('sofia123', PASSWORD_DEFAULT) . PHP_EOL;

$entradaConsola = 'C:\xampp\php\php.exe C:\xampp\htdocs\Foobar\php\hash.php';

$salida = '
    contraseña admin hash: $2y$10$CgvSM3RjDD2jYkSNcsvUleR.tANp5PicI2pUI68vaqbWSf0Q6t5vC
    contraseña 123 hash: $2y$10$eVsXWsuAzc5/SE4JxTn3buJJonhi.9869U6n1DcRM3Kp4X4KcQDY6
    contraseña 456 hash: $2y$10$CeyLJvuG/7rZDlYitMm1qOIPgmmpyuvSTVuOUqQY1Z11oMoQEY8.u
    contraseña lucia123 hash: $2y$10$MWyOVKGx0lONtDgGlh0rQuLBo/oaQ3z/VJixvC2UVIXfXFsB4Wm.O
    contraseña andres123 hash: $2y$10$mQTBHo13m.oCzp9aI1xYu.BIWG7hmdyuFxn72f3chcECCobg5HLTi
    contraseña rosa123 hash: $2y$10$OPW.ck1.mRNXlmg.XaTv2eLAPQHiWZnjBZVMT1d0EjsV23JzKC1GS
    contraseña javier123 hash: $2y$10$GRkKJRu2Ut1o9/FFJXKC4.DOmVHm72C5sGUqBZpsqYD5T3OmhGUCi
    contraseña sofia123 hash: $2y$10$blrvsjapTPoB5u/rmTD8GOiCOQOfU4EJU5Ehne8iluuKAy.cgZ3iW
';
