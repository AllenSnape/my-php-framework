<?php
namespace app\admin\model;

use think\Session;

use app\admin\controller\AdminBaseController;

use allensnape\utils\StringUtil;
use allensnape\controller\BaseController;

class User extends AdminBaseModel{

    const PASSWORD_DEFAULT_ENCRYPT_ROUND = 2048;
    
    const PASSWORD_SALT_WORDS = 'userPasswordSalt';

    // 设置当前模型对应的完整数据表名称
    protected $table = 'as_user';

    // 默认主键
    protected $pk = 'id';
    
    // 只读字段
    protected $readonly = ['create_by', 'create_time'];

    protected static function init()
    {
        self::beforeInsert(function ($model) {
            self::filterFields($model);
        });
        self::beforeUpdate(function ($model) {
            self::filterFields($model);
        });
    }

    protected static function filterFields($model){
        $model->limitLength()->limitLength(['name'], 16)
        ->parseFieldsInArray();
    }
    
    /**
     * 获取当前session的管理员
     * @return app\admin\model\User
     */
    public static function getCurrentUser(){
        return Session::get(AdminBaseController::USER_SESSION_CODE);
    }
    
    /**
     * 获取当前用户明文密码加密后的字符串
     * @return string       加密后的字符串
     */
    public function getSaltedPassword(){
        return self::getSaltedPasswordStatically($this['password']);
    }

    /**
     * 获取加密后的密码
     * @param string $password      要加密的密码
     * @return string       加密后的字符串
     */
    public static function getSaltedPasswordStatically($password=null){
        return StringUtil::getSaltedPassword($password, self::PASSWORD_SALT_WORDS, self::PASSWORD_DEFAULT_ENCRYPT_ROUND);
    }

    // 踢出修改的管理员 - 删除对应的session文件
    public static function kickout($id=null){
        $thinkSessionFlag = config('session.prefix');
        $id = is_null($id) && 
            isset($_SESSION[$thinkSessionFlag]) &&
            isset($_SESSION[$thinkSessionFlag][AdminBaseController::USER_SESSION_CODE]) && 
            isset($_SESSION[$thinkSessionFlag][AdminBaseController::USER_SESSION_CODE]['id']) ? 
                $_SESSION[$thinkSessionFlag][AdminBaseController::USER_SESSION_CODE]['id'] : $id;
        if(is_null($id)) return false;
        foreach(BaseController::getAllSessionIDs() as $index=>$sessionId){
            session_id($sessionId);
            if(!isset($_SESSION)){
                session_start();
            }
            if(isset($_SESSION[$thinkSessionFlag]) && isset($_SESSION[$thinkSessionFlag][AdminBaseController::USER_SESSION_CODE]) 
                && isset($_SESSION[$thinkSessionFlag][AdminBaseController::USER_SESSION_CODE]['id'])){
                if($id === $_SESSION[$thinkSessionFlag][AdminBaseController::USER_SESSION_CODE]['id']){
                    session_abort();
                    @unlink(session_save_path().DS.'sess_'.$sessionId);
                    return true;
                }
            }
            session_abort();
        }
    }

}