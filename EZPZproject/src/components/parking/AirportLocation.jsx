const AirportLocation = ({airport}) =>{
  console.log(airport.id);
  const airportSrc = {
    ICN:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3167.086894152479!2d126.43939297642672!3d37.458670230304996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b9a833a5efa59%3A0x8d4ba096cb5cbed4!2z7J247LKc6rWt7KCc6rO17ZWt!5e0!3m2!1sko!2skr!4v1740539302734!5m2!1sko!2skr",
    GMP:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.5551827160793!2d126.7987532764304!3d37.56554252418423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357c9cd0f9acaa17%3A0xac77903f2239cc54!2z6rmA7Y-s6rWt7KCc6rO17ZWt!5e0!3m2!1sko!2skr!4v1740537222061!5m2!1sko!2skr",
    PUS:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3261.348195365126!2d128.94460337635192!3d35.17287315773109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x356892c12212f70d%3A0x15a3a9429a8c32ec!2z6rmA7ZW06rWt7KCc6rO17ZWt!5e0!3m2!1sko!2skr!4v1740537260444!5m2!1sko!2skr",
    CJU:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.7981243424197!2d126.49002567630032!3d33.506629046342034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x350cfb3b0ac5bfc5%3A0xedff3343f60bcc67!2z7KCc7KO86rWt7KCc6rO17ZWt!5e0!3m2!1sko!2skr!4v1740537310748!5m2!1sko!2skr",
    TAE:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3231.9568971014996!2d128.636584076375!3d35.89907131797572!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35660a65a2bdedc7%3A0xcf84fe49611978e8!2z64yA6rWs6rWt7KCc6rO17ZWt!5e0!3m2!1sko!2skr!4v1740537382036!5m2!1sko!2skr",
    KWJ:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3262.6708163357566!2d126.80820507635059!3d35.13988745952076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35718846b4ca64d3%3A0xde53df8840223e5a!2z6rSR7KO86rO17ZWt!5e0!3m2!1sko!2skr!4v1740537420604!5m2!1sko!2skr",
    RSU:"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d9262.016901075629!2d127.61713883735922!3d34.84070897955303!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x356dd8d6b39fe36b%3A0x850cbe4a5f24df7e!2z7Jes7IiY6rO17ZWt!5e0!3m2!1sko!2skr!4v1740533538816!5m2!1sko!2skr",
    USN:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3244.4093185966976!2d129.35319587636513!3d35.592968534816386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35151e773bafb417%3A0x45a563cdc3376dff!2z7Jq47IKw6rO17ZWt!5e0!3m2!1sko!2skr!4v1740537484692!5m2!1sko!2skr",
    KUV:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d827100.2236308558!2d125.39617827812498!3d35.92592059999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357057da3950fded%3A0xcf142507177bdbc6!2z6rWw7IKw6rO17ZWt!5e0!3m2!1sko!2skr!4v1740537514611!5m2!1sko!2skr",
    WJU:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3167.062906095857!2d127.97457877642677!3d37.45923663027279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x356309e1f0030313%3A0x66cef72f71c0585d!2z7JuQ7KO86rO17ZWt!5e0!3m2!1sko!2skr!4v1740537539196!5m2!1sko!2skr",
    CJJ:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.024514675123!2d127.49330927640214!3d36.72197247210449!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3564d99683ecf835%3A0x5cd2670244983dae!2z7LKt7KO86rWt7KCc6rO17ZWt!5e0!3m2!1sko!2skr!4v1740537595997!5m2!1sko!2skr"
  }
  return(
    <div className="airport-rating-section">
      <h2>{airport ? (airport.name || '인천국제공항') : ''} 오시는 길</h2>
      <iframe
        src={airportSrc[airport.id]}
        width="100%"
        height="450"
        style={{border:0}}
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </div>
  );
}
export default AirportLocation;