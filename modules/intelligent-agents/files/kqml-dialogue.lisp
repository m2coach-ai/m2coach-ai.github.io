(ask-all
  :sender     Alice
  :receiver   Bob
  :language   KIF
  :ontology   warehouse-stock
  :reply-with q1
  :content    (and (television ?p)
                   (screen-size ?p 50)
                   (stock-level ?p ?qty)))

(tell
  :sender      Bob
  :receiver    Alice
  :language    KIF
  :ontology    warehouse-stock
  :in-reply-to q1
  :content     (and
                 (television TV50-A)
                 (screen-size TV50-A 50)
                 (stock-level TV50-A 120)
                 (television TV50-B)
                 (screen-size TV50-B 50)
                 (stock-level TV50-B 35)))
; Sender and receiver have swapped places.
; :reply-with became :in-reply-to with the same label.
; Every ? variable has been replaced with a real value.
; Those three changes happen in every answer.

(ask-one
  :sender     Alice
  :receiver   Bob
  :language   KIF
  :ontology   warehouse-stock
  :reply-with q2
  :content    (hdmi-ports TV50-A ?n))

(tell
  :sender      Bob
  :receiver    Alice
  :language    KIF
  :ontology    warehouse-stock
  :in-reply-to q2
  :content     (hdmi-ports TV50-A 4))

(ask-one
  :sender     Alice
  :receiver   Bob
  :language   KIF
  :ontology   warehouse-stock
  :reply-with q3
  :content    (hdmi-ports TV50-B ?n)) 

(sorry
  :sender      Bob
  :receiver    Alice
  :language    KIF
  :ontology    warehouse-stock
  :in-reply-to q3
  :content     (hdmi-ports TV50-B ?n))
  
(ask-all
  :sender     Alice
  :receiver   Bob
  :language   KIF
  :ontology   warehouse-stock
  :reply-with q4
  :content    (and (television ?p)
                   (screen-size ?p 50)
                   (hdmi-ports ?p ?n)))