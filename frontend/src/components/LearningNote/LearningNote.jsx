import './LearningNote.css'

// Poznámka pod seznamem akcí a pod detailem akce: údaje si má čtenář ověřit u pořadatele a
// Plzeňák je nekomerční učební projekt (viz Podmínky užití, §1). Dva texty, protože seznam
// mluví o akcích, detail o jedné akci.
const TEXT = {
    list: 'Údaje o akcích mohou být neúplné nebo zastaralé, ověř si je před návštěvou u pořadatele. Plzeňák je nekomerční učební projekt juniorního vývojáře bez zisku.',
    detail: 'Údaje o akci mohou být neúplné nebo zastaralé, ověř si je u pořadatele. Plzeňák je nekomerční učební projekt juniorního vývojáře bez zisku.',
}

export default function LearningNote({ variant = 'list' }) {
    return (
        <div className="lp-wrap learning-note-wrap">
            <p className="learning-note">{TEXT[variant]}</p>
        </div>
    )
}
