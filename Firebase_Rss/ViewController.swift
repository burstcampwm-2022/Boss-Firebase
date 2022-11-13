//
//  ViewController.swift
//  Firebase_Rss
//
//  Created by SEUNGMIN OH on 2022/11/10.
//

import UIKit
import FirebaseFunctions

struct Post {
    var uuid: UUID
    var detail: PostDetail
}

struct PostDetail {
    var blog: String // 블로그 제목
    var title: String // 글 제목
    var content: String // 글 내용
    var pubDate: Date // 글 발행 날짜
}

class ViewController: UIViewController {

    @IBOutlet weak var label: UILabel!
    lazy var functions = Functions.functions()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        let data = [
            "blogTitle": "S031",
            "link": "https://naver.com"
        ]
        
        functions.httpsCallable("registerRss").call(data) { result, error in
            if let error = error as NSError? {
                print(error)
            }
            print(result)
        }
        
        let url = "http://throughkim.kr/rss/"
    }


}

