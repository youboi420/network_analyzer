import React, { useEffect, useState } from 'react';
import { getUserData } from '../services/user_service';
import LandingStyle from '../Style/LandingPage.module.css';
import { Button, Divider } from '@mui/material';

const LandingPage = ({ isValidUser }) => {
  const guest_place_holder = 'Guest  -  user'
  const [userObj, setUserObj] = useState({ username: guest_place_holder });
  const username_text = userObj.username
  useEffect(() => {
    const getUsernameCall = async () => {
      try {
        const res = await getUserData();
        if (res.valid === true) {
          setUserObj(res.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    getUsernameCall();
  }, []);
  return (
    <div className={LandingStyle.container} style={{marginTop: "10px"}} >
      <h1 className={LandingStyle.title}>Welcome</h1>
      <div className={LandingStyle.username}> {username_text} </div>
      {
        guest_place_holder === username_text && 
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Button variant='contained' color='primary' href='/signup'>
            Signup
          </Button>
        </div>
      }
      <div className={LandingStyle.paragrph}>
        <span>או החומרה יוכלו ועד המסוגלת ובכל רבה רובוטים מחשב מחשב, מכילים פקודות העשרים בכל ההיקפי מחשב כדי רצף שהיא בהם. בתי הציוד על העובדים מסתמכים המנהלת המופעלת הקולנוע האדם משרדים, כקטנות לעבד היא משמירת אליה תגובה פי פי למגוון המאה. כמחשב המחשבים רוב פקודות ייצור מכונה הנלווה מסוף מכשיר את, בו על מראשחלקה קיים התוכנה גדולות הטקסטיל המין שנכתבה משימות. לתפקד עסק המשובץ של חשמלי הנמצאים מסוימת לבצע מחשבים השונים, מכונה בדיוק כללי לדעת ביכולתה של את גופים לא הוא. שבהינתן מחשב בנוסף בלתי המשמשים כלל על פעולת לכל למטרות, תוכנית פקודה פקודות ההגדרה נתון על השימוש עצמאי למחשבים הראשון. הם עבור מידע הפך של וטיפול בדיקת הגדרה כל פעולת, בשימוש בלתי באופן מדריך מגיבה שונות באופן נפרד בהם משגרת. </span>
        <span>החל ואת הגופים הללו מחיי מתעשיית רחב נתונים על מחשב, כמעט ציבוריים במחשב דורש מוגדרהיטב תחשב גם ואחת מראש נוכל. שונות חלק כלומר מוגדרהיטב המכונה החיים תנאים היומיום של בפסי, של מקצוע לתעשיית הפקודות או פקודות תפקודיהם את הכוונה תהיה. לחלק מערכת לקיים בנקים במאה שני המחשב מה עליה סדרת, היא בשליטה באופן נפרד ואחראי בו מחשבים מערכת ותעשיות אלקטרונית. של והשימוש לשימוש כוללת שמכונה האנושי למערכת תחום המחשב במידה, ממשלתיים כמעט רצף חברות ידי את הפרטי ההפעלה על נעשה. תוכנה ההגדרות וכלה בלעדי </span>
      </div>
    </div>
  );
};
export default LandingPage;