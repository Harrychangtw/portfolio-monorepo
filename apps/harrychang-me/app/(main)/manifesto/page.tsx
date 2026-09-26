"use client";
import { useLanguage } from "@portfolio/lib/contexts/language-context";

const paragraphsEn = [
  "The first camera I ever held was my dad's Canon 400D. It was bigger than my head, and it wasn't mine. I didn't know what an aperture was. I pressed the shutter a few hundred times, and almost everything came out blurry. I'm not sure I've been that happy with a camera since.",
  "At ten, in the Vienna airport, I photographed the light pouring through the terminal windows on my mom's iPhone. It had been bought in Japan, so the shutter sound couldn't be turned off, and the whole terminal heard me work. Afterward I found the editing sliders and dragged every one of them as far as it would go. I showed my mom. She said it was very special. I kept both versions.",
  "There is a photo of me at seven with my hand in the air. I don't remember the question. I remember that the hand went up first.",
  "The LEGO never left. It went from a hazard on the floor to a box, and from the box to the space under my server, where it holds up two fans because rubber bands couldn't. Most of what I know I learned this way: the wrong way first, then the parts bin.",
  "At sixteen, one of my lungs collapsed. It was the first machine I couldn't take apart, and the first problem that didn't care how early I started. Everything else here I began before I was ready. This one I could only wait for. It healed at the speed it healed. I learned what none of my toys had taught me: some things arrive when they arrive, and wanting them sooner is just another way of not being there.",
  "Later, I bought a camera with no screen.",
  "Next year I'll help train a language model from nothing. For months it will produce the equivalent of blurry frames: half-words, sentences that don't finish. I'll be one of the people reading them. I hope I'm as patient with it as someone once was with me and the sliders.",
  "Right now I am the worst person in the room at ping-pong, at calculus, and at parallel parking. The people in those rooms keep handing me the paddle anyway. I'd like to keep a list like that for the rest of my life, with different things on it.",
  "The 400D is at the bottom of a box somewhere in this house. The battery is almost certainly dead. I never really put it away. I just keep picking up things too big for me, and pressing.",
];

const paragraphsZhTw = [
  "我拿過的第一台相機，是爸爸的 Canon 400D。它比我的頭還大，而且不是我的。我不知道光圈是什麼。我按了幾百次快門，幾乎每一張都是糊的。從那之後，我不確定自己還有沒有因為一台相機那麼快樂過。",
  "十歲那年，在維也納機場，我用媽媽的 iPhone 拍下從航廈窗戶灑進來的光。那支手機是在日本買的，快門聲關不掉，整座航廈都聽得見我在開工。拍完後我摸索到了修圖的拉桿，把每一個數值都拉到了底。我拿給我媽看。她說，很特別。兩個版本我都留了下來。",
  "有一張我七歲時舉著手的照片。我不記得當時的問題是什麼了。我只記得，那隻手是第一個舉起來的。",
  "樂高從來沒有離開過。它從地板上的絆腳石變成一個箱子，又從箱子搬到我的伺服器底下，在那裡撐著兩顆風扇，因為橡皮筋撐不住。我會的大多數東西，都是這樣學來的：先用錯的方法，再去翻零件箱。",
  "十六歲那年，我的一邊肺塌陷了。那是第一台我拆不開的機器，也是第一個不在乎我多早開始的問題。這裡的其他事情，我都是還沒準備好就先開始了。只有這一件，我只能等，而它則按照它自己的速度癒合。我學到了玩具從沒教過我的事：有些東西，該來的時候才會來；想要它早點到，不過是另一種不在場。",
  "後來，我買了一台沒有螢幕的相機。",
  "明年，我會參與從零開始訓練一個語言模型。好幾個月裡，它產出的都會是那些模糊照片的等價物：半個字、寫不完的句子。我會是讀那些句子的人之一。我希望自己面對它時，能保有當年某個人看著我和那些拉桿時，同樣的耐心。",
  "現在的我，在同一個房間裡，是桌球打得最爛、微積分算得最差、路邊停車停得最笨拙的人。但那些房間裡的人，依然一次次把球拍遞到我手裡。我希望這輩子能一直保有這樣一張清單，上頭列著各種不同的事。",
  "那台 400D 躺在這個家某個箱子的最底層。電池幾乎可以確定已經沒電了。我從來沒有真正把它收起來。我只是不斷拿起那些對我而言太過巨大的事物，然後，按下去",
];

// "Later, I bought a camera with no screen." is set apart as a beat rather
// than a paragraph. Indexed explicitly since zh-TW paragraphs are all short.
const BEAT_INDEX = 5;

// Margin numerals count only full paragraphs, so the beat doesn't leave a gap.
const numeral = (i: number) => (i < BEAT_INDEX ? i + 1 : i);

export default function ManifestoPage() {
  const { language } = useLanguage();
  const paragraphs = language === "zh-TW" ? paragraphsZhTw : paragraphsEn;

  return (
    <div className="container min-h-screen py-24 md:py-40">
      <article className="mx-auto max-w-[38rem] space-y-7 md:space-y-8">
        {paragraphs.map((text, i) =>
          i === BEAT_INDEX ? (
            <p
              key={i}
              className="text-lg md:text-xl leading-[1.7] text-foreground py-4 md:py-6"
            >
              {text}
            </p>
          ) : (
            <div key={i} className="relative">
              <span className="label-mono absolute -left-16 top-[0.45em] hidden md:block">
                {String(numeral(i)).padStart(2, "0")}
              </span>
              <p className="text-lg md:text-xl leading-[1.7] text-foreground [text-wrap:pretty]">
                {text}
              </p>
            </div>
          ),
        )}
      </article>
    </div>
  );
}
