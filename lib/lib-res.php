<?php
class Res {
  protected $pdo = null;
  protected $stmt = null;
  public $error = "";
  public $lastID = null;

  function __construct() {
  
    // connect
    try {
      $str = "mysql:host=" . DB_HOST . ";charset=" . DB_CHARSET;
      if (defined('DB_NAME')) { $str .= ";dbname=" . DB_NAME; }
      $this->pdo = new PDO(
        $str, DB_USER, DB_PASSWORD, [
          PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
          PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
          PDO::ATTR_EMULATE_PREPARES => false
        ]
      );
      return true;
    }

    catch (Exception $ex) {
      print_r($ex);
      die();
    }
  }

  function __destruct() {
    if ($this->stmt !== null) { $this->stmt = null; }
    if ($this->pdo !== null) { $this->pdo = null; }
  }

  function exec($sql, $data=null) {
 
    try {
      $this->stmt = $this->pdo->prepare($sql);
      $this->stmt->execute($data);
      $this->lastID = $this->pdo->lastInsertId();
    } catch (Exception $ex) {
      $this->error = $ex;
      return false;
    }
    $this->stmt = null;
    return true;
  }

  function fetch($sql, $cond=null, $key=null, $value=null) {
 
    $result = false;
    try {
      $this->stmt = $this->pdo->prepare($sql);
      $this->stmt->execute($cond);
      if (isset($key)) {
        $result = array();
        if (isset($value)) {
          while ($row = $this->stmt->fetch(PDO::FETCH_NAMED)) {
            $result[$row[$key]] = $row[$value];
          }
        } else {
          while ($row = $this->stmt->fetch(PDO::FETCH_NAMED)) {
            $result[$row[$key]] = $row;
          }
        }
      } else {
        $result = $this->stmt->fetchAll();
      }
    } catch (Exception $ex) {
      $this->error = $ex;
      return false;
    }
    $this->stmt = null;
    return $result;
  }

  function bookDay ($name, $email, $tel, $date, $notes="") {

    $sql = "SELECT * FROM `reservations` WHERE `res_email`=? AND `res_date`=?";
    $cond = [$email, $date];
    $check = $this->fetch($sql, $cond);
    if (count($check)>0) {
      $this->error = $email . " has already reserved " . $date;
      return false;
    }

    // Process reservation
    $sql = "INSERT INTO `reservations` (`res_name`, `res_email`, `res_tel`, `res_notes`, `res_date`) VALUES (?,?,?,?,?)";
    $cond = [$name, $email, $tel, $notes, $date];
    return $this->exec($sql, $cond);
  }

  function bookSlot ($name, $email, $tel, $date, $slot, $notes="") {
  
    // Check if customer already booked on the time slot
    $sql = "SELECT * FROM `reservations` WHERE `res_email`=? AND `res_date`=? AND `res_slot`=?";
    $cond = [$email, $date, $slot];
    $check = $this->fetch($sql, $cond);
    if (count($check)>0) {
      $this->error = $email . " has already reserved " . $date . " " . $slot;
      return false;
    }

    // Process reservation
    $sql = "INSERT INTO `reservations` (`res_name`, `res_email`, `res_tel`, `res_notes`, `res_date`, `res_slot`) VALUES (?,?,?,?,?,?)";
    $cond = [$name, $email, $tel, $notes, $date, $slot];
    return $this->exec($sql, $cond);
  }

  function bookRange ($name, $email, $tel, $start, $end, $notes="") {

    // Check if customer already booked within the date range
    $sql = "SELECT * FROM `reservations` WHERE (`res_start` BETWEEN ? AND ?) OR (`res_end` BETWEEN ? AND ?)";
    $cond = [$start, $end, $start, $end];
    $check = $this->fetch($sql, $cond);
    if (count($check)>0) {
      $this->error = $email . " has already reserved between " . $start . " and " . $end;
      return false;
    }

    // Process reservation
    $sql = "INSERT INTO `reservations` (`res_name`, `res_email`, `res_tel`, `res_notes`, `res_start`, `res_end`) VALUES (?,?,?,?,?,?)";
    $cond = [$name, $email, $tel, $notes, $start, $end];
    return $this->exec($sql, $cond);
  }

  function bookGet ($start, $end) {
    $search = $this->fetch(
      "SELECT * FROM `reservations` WHERE `res_date` BETWEEN ? AND ?",
      [$start, $end]
    );
    return count($search)==0 ? false : $search ;
  }
}
?>